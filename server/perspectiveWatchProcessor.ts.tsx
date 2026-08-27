import type {
  Express,
  Request,
  Response,
} from 'express';

import { getAuth } from 'firebase-admin/auth';

import {
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

const DEFAULT_BATCH_SIZE = 100;

const getString = (
  value: unknown
): string => {
  return typeof value === 'string'
    ? value.trim()
    : '';
};

const getBoolean = (
  value: unknown
): boolean => {
  return value === true;
};

const escapeHtml = (
  value: string
): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

/**
 * Resolve the owner UID from:
 *
 * users/{uid}/perspectiveWatches/{watchId}
 */
const getUidFromWatchRef = (
  ref: FirebaseFirestore.DocumentReference
): string | null => {
  const userDocument =
    ref.parent.parent;

  if (!userDocument) {
    return null;
  }

  if (
    userDocument.parent.id !==
    'users'
  ) {
    return null;
  }

  return userDocument.id;
};

const isDue = (
  revisitAt: string,
  nowMs: number
): boolean => {
  if (!revisitAt) {
    return false;
  }

  const parsed =
    Date.parse(revisitAt);

  return (
    Number.isFinite(parsed) &&
    parsed <= nowMs
  );
};

interface ProcessResult {
  processed: number;
  markedDue: number;
  emailsQueued: number;
  skipped: number;
  errors: number;
}

/**
 * Process scheduled Perspective Watches.
 *
 * IMPORTANT:
 * - No full journal text enters email.
 * - Only topic + app link are emailed.
 * - Recipient comes from Firebase Auth.
 * - Email jobs are created only from trusted server code.
 */
export async function processPerspectiveWatches(): Promise<ProcessResult> {
  const now =
    new Date();

  const nowIso =
    now.toISOString();

  const nowMs =
    now.getTime();

  const result: ProcessResult = {
    processed: 0,
    markedDue: 0,
    emailsQueued: 0,
    skipped: 0,
    errors: 0,
  };

  /*
   * We intentionally query only scheduled watches.
   *
   * We then perform revisitAt comparison in code,
   * avoiding another composite-query requirement.
   */
  const watchSnapshot =
    await firestore
      .collectionGroup(
        'perspectiveWatches'
      )
      .where(
        'status',
        '==',
        'scheduled'
      )
      .limit(
        DEFAULT_BATCH_SIZE
      )
      .get();

  for (
    const watchDoc
    of watchSnapshot.docs
  ) {
    result.processed += 1;

    try {
      const watchData =
        watchDoc.data() || {};

      const watchId =
        watchDoc.id;

      const uid =
        getUidFromWatchRef(
          watchDoc.ref
        );

      if (!uid) {
        result.skipped += 1;

        console.warn(
          '[PerspectiveWatch] Invalid owner path:',
          watchDoc.ref.path
        );

        continue;
      }

      const diffId =
        getString(
          watchData.diffId
        );

      const topic =
        getString(
          watchData.topic
        ) ||
        'a saved perspective';

      const revisitAt =
        getString(
          watchData.revisitAt
        );

      const emailEnabled =
        getBoolean(
          watchData.emailEnabled
        );

      if (
        !diffId ||
        !revisitAt
      ) {
        result.skipped += 1;

        console.warn(
          '[PerspectiveWatch] Missing required fields:',
          {
            watchId,
            uid,
          }
        );

        continue;
      }

      if (
        !isDue(
          revisitAt,
          nowMs
        )
      ) {
        result.skipped += 1;

        continue;
      }

      /*
       * Resolve email before transaction.
       *
       * Email never comes from request payload.
       */
      let recipientEmail:
        string | null = null;

      if (emailEnabled) {
        try {
          const authUser =
            await getAuth()
              .getUser(uid);

          recipientEmail =
            authUser.email ||
            null;
        } catch (authError) {
          console.warn(
            '[PerspectiveWatch] Could not resolve Firebase Auth user:',
            {
              uid,
              watchId,
              authError,
            }
          );
        }
      }

      /*
       * Generate mail ID before transaction
       * so duplicate processing can be blocked
       * transactionally.
       */
      const mailRef =
        firestore
          .collection('mail')
          .doc();

      const appBaseUrl =
        getString(
          process.env
            .APP_BASE_URL
        );

      await firestore.runTransaction(
        async (
          transaction
        ) => {
          const freshWatch =
            await transaction.get(
              watchDoc.ref
            );

          if (
            !freshWatch.exists
          ) {
            return;
          }

          const freshData =
            freshWatch.data() ||
            {};

          const freshStatus =
            getString(
              freshData.status
            );

          const freshRevisitAt =
            getString(
              freshData.revisitAt
            );

          const alreadyQueued =
            Boolean(
              freshData.emailQueuedAt
            );

          /*
           * Another processor may already have
           * processed this watch.
           */
          if (
            freshStatus !==
              'scheduled' ||
            !isDue(
              freshRevisitAt,
              nowMs
            )
          ) {
            return;
          }

          const watchUpdate:
            Record<
              string,
              unknown
            > = {
              status: 'due',

              dueAt:
                nowIso,

              updatedAt:
                nowIso,

              serverUpdatedAt:
                FieldValue
                  .serverTimestamp(),
            };

          /*
           * Email disabled:
           * mark due only.
           */
          if (
            !emailEnabled
          ) {
            transaction.update(
              watchDoc.ref,
              watchUpdate
            );

            result.markedDue += 1;

            return;
          }

          /*
           * Email enabled but already queued.
           */
          if (alreadyQueued) {
            transaction.update(
              watchDoc.ref,
              watchUpdate
            );

            result.markedDue += 1;

            return;
          }

          /*
           * User has no Firebase Auth email.
           */
          if (
            !recipientEmail
          ) {
            transaction.update(
              watchDoc.ref,
              {
                ...watchUpdate,

                emailError:
                  'No verified Firebase Authentication email address is available for this user.',
              }
            );

            result.markedDue += 1;

            return;
          }

          const safeTopic =
            escapeHtml(topic);

          const safeBaseUrl =
            appBaseUrl
              ? escapeHtml(
                  appBaseUrl
                )
              : '';

          const subject =
            `MirrorTrace: revisit "${topic}"`;

          const textLines = [
            'A Perspective Watch you scheduled is now due.',
            '',
            `Topic: ${topic}`,
            '',
            'MirrorTrace is asking you to revisit this perspective intentionally.',
            'No journal text or private reflection content is included in this email.',
          ];

          if (appBaseUrl) {
            textLines.push(
              '',
              `Open MirrorTrace: ${appBaseUrl}`
            );
          }

          const html =
            `
              <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;color:#1c1917;">
                <div style="font-size:13px;color:#92400e;font-weight:700;margin-bottom:8px;">
                  MirrorTrace · Perspective Watch
                </div>

                <h2 style="margin:0 0 14px;font-size:22px;">
                  Time to revisit a perspective
                </h2>

                <p style="line-height:1.6;">
                  A Perspective Watch you scheduled is now due.
                </p>

                <div style="margin:20px 0;padding:16px;border:1px solid #f0d8b0;border-radius:12px;background:#fffaf0;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#78716c;">
                    Topic
                  </div>

                  <div style="margin-top:6px;font-size:17px;font-weight:700;">
                    ${safeTopic}
                  </div>
                </div>

                <p style="line-height:1.6;">
                  Revisit the perspective and decide whether it still reflects your thinking.
                </p>

                ${
                  appBaseUrl
                    ? `
                      <p style="margin-top:24px;">
                        <a
                          href="${safeBaseUrl}"
                          style="display:inline-block;background:#92400e;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:700;"
                        >
                          Open MirrorTrace
                        </a>
                      </p>
                    `
                    : ''
                }

                <p style="margin-top:24px;font-size:12px;line-height:1.6;color:#78716c;">
                  Privacy note: this email intentionally contains no journal text,
                  reflection excerpt, Thought Snapshot text, or private AI memory.
                </p>
              </div>
            `;

          /*
           * Firebase Trigger Email extension
           * watches this trusted mail collection.
           */
          transaction.set(
            mailRef,
            {
              to: [
                recipientEmail,
              ],

              message: {
                subject,

                text:
                  textLines.join(
                    '\n'
                  ),

                html,
              },

              mirrorTrace: {
                type:
                  'perspective_watch',

                uid,

                watchId,

                diffId,

                topic,
              },

              createdAt:
                FieldValue
                  .serverTimestamp(),
            }
          );

          transaction.update(
            watchDoc.ref,
            {
              ...watchUpdate,

              emailQueuedAt:
                nowIso,

              emailJobId:
                mailRef.id,

              emailError:
                null,
            }
          );

          result.markedDue += 1;
          result.emailsQueued += 1;
        }
      );
    } catch (error) {
      result.errors += 1;

      console.error(
        '[PerspectiveWatch] Processing failed:',
        {
          watchId:
            watchDoc.id,

          path:
            watchDoc.ref.path,

          error:
            error instanceof Error
              ? error.message
              : String(error),
        }
      );
    }
  }

  console.log(
    '[PerspectiveWatch] Processor complete:',
    result
  );

  return result;
}

/**
 * Protected scheduler endpoint.
 *
 * Cloud Scheduler sends:
 *
 * x-mirrortrace-scheduler-secret
 *
 * The secret must be injected from Secret Manager.
 */
export function registerPerspectiveWatchProcessor(
  app: Express
): void {
  app.post(
    '/api/internal/process-perspective-watches',
    async (
      req: Request,
      res: Response
    ) => {
      const configuredSecret =
        getString(
          process.env
            .WATCH_PROCESSOR_SECRET
        );

      if (!configuredSecret) {
        return res
          .status(503)
          .json({
            success: false,

            error:
              'watch_processor_not_configured',

            message:
              'Perspective Watch processor secret is not configured.',
          });
      }

      const suppliedSecret =
        getString(
          req.header(
            'x-mirrortrace-scheduler-secret'
          )
        );

      /*
       * Avoid exposing whether a supplied
       * secret was close/correct.
       */
      if (
        !suppliedSecret ||
        suppliedSecret !==
          configuredSecret
      ) {
        return res
          .status(401)
          .json({
            success: false,

            error:
              'unauthorized',
          });
      }

      try {
        const result =
          await processPerspectiveWatches();

        return res
          .status(200)
          .json({
            success: true,
            ...result,
          });
      } catch (
        error: unknown
      ) {
        console.error(
          '[PerspectiveWatch] Processor endpoint failed:',
          error
        );

        return res
          .status(500)
          .json({
            success: false,

            error:
              'perspective_watch_processing_failed',

            message:
              error instanceof Error
                ? error.message
                : 'Unknown Perspective Watch processor error.',
          });
      }
    }
  );
}