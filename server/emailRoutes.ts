import {
  Router,
} from 'express';

import {
  getAuth,
} from 'firebase-admin/auth';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

import {
  sendMirrorTraceEmail,
  sendPerspectiveWatchEmail,
  verifyEmailTransport,
} from './emailService.ts';

const router =
  Router();

function safeText(
  value: unknown,
  maxLength = 1000
): string {
  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  return value
    .trim()
    .slice(
      0,
      maxLength
    );
}

function schedulerSecret():
  string {
  return (
    safeText(
      process.env
        .MIRRORTRACE_SCHEDULER_SECRET
    ) ||
    safeText(
      process.env
        .WATCH_PROCESSOR_SECRET
    )
  );
}

router.get(
  '/api/notifications/email/status',
  authMiddleware,
  async (
    _req:
      AuthenticatedRequest,
    res
  ) => {
    const configured =
      Boolean(
        process.env
          .MIRRORTRACE_SMTP_HOST &&
        process.env
          .MIRRORTRACE_SMTP_USER &&
        process.env
          .MIRRORTRACE_SMTP_PASSWORD &&
        process.env
          .MIRRORTRACE_EMAIL_FROM
      );

    return res
      .status(200)
      .json({
        configured,
      });
  }
);

router.post(
  '/api/notifications/email/verify',
  authMiddleware,
  async (
    _req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      await verifyEmailTransport();

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            'MirrorTrace SMTP connection verified.',
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Email] SMTP verification failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'smtp_verification_failed',

          message:
            (error as Error)
              ?.message ||
            'Could not verify SMTP connection.',
        });
    }
  }
);

router.post(
  '/api/notifications/email/test',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const uid =
        req.user!.uid;

      const user =
        await getAuth()
          .getUser(
            uid
          );

      const email =
        safeText(
          user.email,
          320
        );

      if (!email) {
        return res
          .status(400)
          .json({
            error:
              'email_unavailable',

            message:
              'Your Firebase account does not have an email address.',
          });
      }

      const result =
        await sendMirrorTraceEmail({
          to:
            email,

          subject:
            'MirrorTrace email delivery is ready',

          text:
            [
              'MirrorTrace email reminders are working.',
              '',
              'Perspective Watch can now remind you by email.',
              '',
              'For privacy, reminder emails never contain your private journal text.',
            ].join(
              '\n'
            ),
        });

      return res
        .status(200)
        .json({
          success:
            true,

          messageId:
            result.messageId,

          accepted:
            result.accepted.length,

          rejected:
            result.rejected.length,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Email] Test delivery failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'email_test_failed',

          message:
            (error as Error)
              ?.message ||
            'Could not send the test email.',
        });
    }
  }
);

router.post(
  '/api/internal/process-perspective-email',
  async (
    req,
    res
  ) => {
    try {
      const expectedSecret =
        schedulerSecret();

      if (!expectedSecret) {
        return res
          .status(503)
          .json({
            error:
              'scheduler_not_configured',
          });
      }

      const providedSecret =
        safeText(
          req.get(
            'x-mirrortrace-scheduler-secret'
          )
        );

      if (
        !providedSecret ||
        providedSecret !==
          expectedSecret
      ) {
        return res
          .status(401)
          .json({
            error:
              'scheduler_unauthorized',
          });
      }

      const nowIso =
        new Date()
          .toISOString();

      const snapshot =
        await firestore
          .collectionGroup(
            'perspectiveWatches'
          )
          .where(
            'revisitAt',
            '<=',
            nowIso
          )
          .limit(
            100
          )
          .get();

      let processed =
        0;

      let sent =
        0;

      let failed =
        0;

      let skipped =
        0;

      for (
        const watchDoc of
        snapshot.docs
      ) {
        const data =
          watchDoc.data() ||
          {};

        const status =
          safeText(
            data.status
          );

        if (
          status !==
            'scheduled' &&
          status !==
            'due'
        ) {
          skipped +=
            1;

          continue;
        }

        if (
          data.emailEnabled !==
          true
        ) {
          skipped +=
            1;

          continue;
        }

        if (
          safeText(
            data.emailSentAt
          )
        ) {
          skipped +=
            1;

          continue;
        }

        const userDoc =
          watchDoc.ref
            .parent
            .parent;

        const uid =
          userDoc?.id ||
          '';

        if (!uid) {
          skipped +=
            1;

          continue;
        }

        processed +=
          1;

        try {
          const user =
            await getAuth()
              .getUser(
                uid
              );

          const email =
            safeText(
              user.email,
              320
            );

          if (!email) {
            throw new Error(
              'Firebase user does not have an email address.'
            );
          }

          const topic =
            safeText(
              data.topic,
              160
            ) ||
            'Your perspective';

          const result =
            await sendPerspectiveWatchEmail({
              to:
                email,

              topic,

              appUrl:
                process.env
                  .MIRRORTRACE_APP_URL ||
                process.env
                  .APP_BASE_URL,
            });

          sent +=
            1;

          await watchDoc
            .ref
            .set(
              {
                status:
                  status ===
                  'scheduled'
                    ? 'due'
                    : status,

                dueAt:
                  data.dueAt ||
                  nowIso,

                emailAttemptedAt:
                  nowIso,

                emailSentAt:
                  nowIso,

                emailMessageId:
                  result.messageId,

                emailError:
                  null,

                updatedAt:
                  nowIso,

                serverUpdatedAt:
                  FieldValue
                    .serverTimestamp(),
              },
              {
                merge:
                  true,
              }
            );
        } catch (
          error
        ) {
          failed +=
            1;

          console.warn(
            '[MirrorTrace Email] Perspective Watch email failed:',
            {
              uid,

              watchId:
                watchDoc.id,

              error:
                (error as Error)
                  ?.message,
            }
          );

          await watchDoc
            .ref
            .set(
              {
                emailAttemptedAt:
                  nowIso,

                emailError:
                  String(
                    (error as Error)
                      ?.message ||
                      'Unknown email delivery error'
                  )
                    .slice(
                      0,
                      500
                    ),

                updatedAt:
                  nowIso,

                serverUpdatedAt:
                  FieldValue
                    .serverTimestamp(),
              },
              {
                merge:
                  true,
              }
            )
            .catch(
              () =>
                undefined
            );
        }
      }

      return res
        .status(200)
        .json({
          success:
            true,

          processed,

          sent,

          failed,

          skipped,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Email] Scheduled processor failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'perspective_email_processing_failed',

          message:
            (error as Error)
              ?.message ||
            'Perspective Watch email processing failed.',
        });
    }
  }
);

export {
  router as emailRouter,
};