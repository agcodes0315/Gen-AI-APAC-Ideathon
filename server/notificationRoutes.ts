import {
  Router,
} from 'express';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

import {
  registerPushDevice,
  unregisterPushDevice,
  sendPerspectiveWatchPush,
  sendPushToUser,
} from './notificationService.ts';

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

/* ============================================================
   PUBLIC FIREBASE WEB CONFIG
   ============================================================ */

router.get(
  '/api/notifications/firebase-config',
  (_req, res) => {
    const config = {
      apiKey:
        safeText(
          process.env
            .VITE_FIREBASE_API_KEY
        ),

      authDomain:
        safeText(
          process.env
            .VITE_FIREBASE_AUTH_DOMAIN
        ),

      projectId:
        safeText(
          process.env
            .VITE_FIREBASE_PROJECT_ID
        ) ||
        safeText(
          process.env
            .FIREBASE_PROJECT_ID
        ),

      storageBucket:
        safeText(
          process.env
            .VITE_FIREBASE_STORAGE_BUCKET
        ),

      messagingSenderId:
        safeText(
          process.env
            .VITE_FIREBASE_MESSAGING_SENDER_ID
        ),

      appId:
        safeText(
          process.env
            .VITE_FIREBASE_APP_ID
        ),
    };

    if (
      !config.apiKey ||
      !config.projectId ||
      !config.messagingSenderId ||
      !config.appId
    ) {
      return res
        .status(503)
        .json({
          error:
            'firebase_messaging_not_configured',

          message:
            'Firebase Messaging configuration is incomplete.',
        });
    }

    res.setHeader(
      'Cache-Control',
      'public, max-age=300'
    );

    return res
      .status(200)
      .json(config);
  }
);

/* ============================================================
   PUSH STATUS
   ============================================================ */

router.get(
  '/api/notifications/push/status',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const uid =
        req.user!.uid;

      const snapshot =
        await firestore
          .collection('users')
          .doc(uid)
          .collection(
            'pushDevices'
          )
          .where(
            'enabled',
            '==',
            true
          )
          .limit(25)
          .get();

      return res
        .status(200)
        .json({
          success:
            true,

          registeredDevices:
            snapshot.size,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Push] Status lookup failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'push_status_failed',

          message:
            'Could not read push-device registration status.',
        });
    }
  }
);

/* ============================================================
   REGISTER DEVICE
   ============================================================ */

router.post(
  '/api/notifications/push/register',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const uid =
        req.user!.uid;

      const body =
        req.body &&
        typeof req.body ===
          'object'
          ? req.body
          : {};

      const token =
        safeText(
          body.token,
          4096
        );

      if (!token) {
        return res
          .status(400)
          .json({
            error:
              'push_token_required',

            message:
              'Push token is required.',
          });
      }

      await registerPushDevice({
        uid,

        token,

        platform:
          safeText(
            body.platform,
            120
          ),

        userAgent:
          safeText(
            body.userAgent,
            1000
          ),

        timezone:
          safeText(
            body.timezone,
            120
          ),
      });

      const snapshot =
        await firestore
          .collection('users')
          .doc(uid)
          .collection(
            'pushDevices'
          )
          .where(
            'enabled',
            '==',
            true
          )
          .limit(25)
          .get();

      return res
        .status(201)
        .json({
          success:
            true,

          registeredDevices:
            snapshot.size,

          message:
            'This device is registered for MirrorTrace push notifications.',
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Push] Registration failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'push_registration_failed',

          message:
            (error as Error)
              ?.message ||
            'Could not register this device for notifications.',
        });
    }
  }
);

/* ============================================================
   UNREGISTER DEVICE
   ============================================================ */

router.post(
  '/api/notifications/push/unregister',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const uid =
        req.user!.uid;

      const body =
        req.body &&
        typeof req.body ===
          'object'
          ? req.body
          : {};

      const token =
        safeText(
          body.token,
          4096
        );

      if (!token) {
        return res
          .status(400)
          .json({
            error:
              'push_token_required',

            message:
              'Push token is required.',
          });
      }

      await unregisterPushDevice(
        uid,
        token
      );

      const snapshot =
        await firestore
          .collection('users')
          .doc(uid)
          .collection(
            'pushDevices'
          )
          .where(
            'enabled',
            '==',
            true
          )
          .limit(25)
          .get();

      return res
        .status(200)
        .json({
          success:
            true,

          registeredDevices:
            snapshot.size,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Push] Unregister failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'push_unregister_failed',

          message:
            'Could not unregister this device.',
        });
    }
  }
);

/* ============================================================
   TEST PUSH
   ============================================================ */

router.post(
  '/api/notifications/push/test',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const uid =
        req.user!.uid;

      const appUrl =
        safeText(
          process.env
            .MIRRORTRACE_APP_URL
        ) ||
        safeText(
          process.env
            .APP_BASE_URL
        ) ||
        '/';

      const result =
        await sendPushToUser({
          uid,

          title:
            'MirrorTrace notifications are ready',

          body:
            'Your device can receive Perspective Watch reminders.',

          url:
            appUrl,

          tag:
            'mirrortrace-test',

          type:
            'notification_test',

          topic:
            'Notification test',
        });

      if (
        result.attempted ===
        0
      ) {
        return res
          .status(404)
          .json({
            error:
              'no_registered_devices',

            message:
              'No active push devices are registered for this account.',
          });
      }

      if (
        result.delivered ===
        0
      ) {
        return res
          .status(502)
          .json({
            error:
              'push_delivery_failed',

            message:
              'MirrorTrace found the registered device, but Firebase could not deliver the test notification.',

            ...result,
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,

          ...result,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Push] Test failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'push_test_failed',

          message:
            (error as Error)
              ?.message ||
            'Could not send the test notification.',
        });
    }
  }
);

/* ============================================================
   INTERNAL PERSPECTIVE WATCH PUSH PROCESSOR
   ============================================================ */

router.post(
  '/api/internal/process-perspective-push',
  async (
    req,
    res
  ) => {
    try {
      const expectedSecret =
        safeText(
          process.env
            .MIRRORTRACE_SCHEDULER_SECRET
        ) ||
        safeText(
          process.env
            .WATCH_PROCESSOR_SECRET
        );

      if (!expectedSecret) {
        return res
          .status(503)
          .json({
            error:
              'scheduler_not_configured',

            message:
              'Perspective Watch scheduler secret is not configured.',
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

      const watches =
        await firestore
          .collectionGroup(
            'perspectiveWatches'
          )
          .where(
            'revisitAt',
            '<=',
            nowIso
          )
          .limit(100)
          .get();

      let processed =
        0;

      let delivered =
        0;

      let failed =
        0;

      let skipped =
        0;

      const appUrl =
        safeText(
          process.env
            .MIRRORTRACE_APP_URL
        ) ||
        safeText(
          process.env
            .APP_BASE_URL
        );

      for (
        const watchDoc of
        watches.docs
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
          safeText(
            data.pushNotifiedAt
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

        const watchId =
          watchDoc.id;

        const diffId =
          safeText(
            data.diffId
          );

        const topic =
          safeText(
            data.topic,
            120
          ) ||
          'Your perspective';

        processed +=
          1;

        try {
          const result =
            await sendPerspectiveWatchPush({
              uid,

              watchId,

              diffId,

              topic,

              appUrl,
            });

          delivered +=
            result.delivered;

          failed +=
            result.failed;

          const updateData:
            Record<
              string,
              unknown
            > = {
            updatedAt:
              nowIso,

            serverUpdatedAt:
              FieldValue
                .serverTimestamp(),

            pushAttemptedAt:
              nowIso,

            pushDeliveredCount:
              result.delivered,

            pushFailedCount:
              result.failed,
          };

          if (
            result.delivered >
            0
          ) {
            updateData
              .pushNotifiedAt =
              nowIso;

            updateData
              .pushError =
              null;
          }

          if (
            status ===
            'scheduled'
          ) {
            updateData.status =
              'due';

            updateData.dueAt =
              nowIso;
          }

          await watchDoc
            .ref
            .set(
              updateData,
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
            '[MirrorTrace Push] Perspective Watch push failed:',
            {
              uid,

              watchId,

              message:
                (error as Error)
                  ?.message,
            }
          );

          await watchDoc
            .ref
            .set(
              {
                pushAttemptedAt:
                  nowIso,

                pushError:
                  String(
                    (error as Error)
                      ?.message ||
                      'Unknown push error'
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

          delivered,

          failed,

          skipped,
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Push] Scheduled processing failed:',
        (error as Error)
          ?.message
      );

      return res
        .status(500)
        .json({
          error:
            'perspective_push_processing_failed',

          message:
            (error as Error)
              ?.message ||
            'Could not process Perspective Watch push reminders.',
        });
    }
  }
);

export {
  router as notificationRouter,
};