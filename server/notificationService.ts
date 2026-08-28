import crypto from 'crypto';

import {
  getMessaging,
} from 'firebase-admin/messaging';

import {
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

export interface RegisterPushDeviceInput {
  uid: string;

  token: string;

  platform?: string;

  userAgent?: string;

  timezone?: string;
}

export interface PushDeliveryResult {
  attempted: number;

  delivered: number;

  failed: number;

  invalidTokensRemoved:
    number;
}

function safeText(
  value: unknown,
  maxLength = 500
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

function tokenDocumentId(
  token: string
): string {
  return crypto
    .createHash(
      'sha256'
    )
    .update(token)
    .digest('hex');
}

export async function registerPushDevice(
  input:
    RegisterPushDeviceInput
): Promise<void> {
  const uid =
    safeText(
      input.uid,
      200
    );

  const token =
    safeText(
      input.token,
      4096
    );

  if (
    !uid ||
    !token
  ) {
    throw new Error(
      'A valid authenticated UID and FCM token are required.'
    );
  }

  const id =
    tokenDocumentId(
      token
    );

  const nowIso =
    new Date()
      .toISOString();

  await firestore
    .collection('users')
    .doc(uid)
    .collection(
      'pushDevices'
    )
    .doc(id)
    .set(
      {
        id,

        token,

        enabled:
          true,

        platform:
          safeText(
            input.platform,
            120
          ) ||
          'web',

        userAgent:
          safeText(
            input.userAgent,
            1000
          ),

        timezone:
          safeText(
            input.timezone,
            120
          ),

        createdAt:
          nowIso,

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
}

export async function unregisterPushDevice(
  uid: string,
  token: string
): Promise<void> {
  const cleanUid =
    safeText(
      uid,
      200
    );

  const cleanToken =
    safeText(
      token,
      4096
    );

  if (
    !cleanUid ||
    !cleanToken
  ) {
    return;
  }

  await firestore
    .collection('users')
    .doc(cleanUid)
    .collection(
      'pushDevices'
    )
    .doc(
      tokenDocumentId(
        cleanToken
      )
    )
    .delete();
}

export async function getActivePushTokens(
  uid: string
): Promise<string[]> {
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

  return snapshot.docs
    .map(
      (document) =>
        safeText(
          document
            .data()
            .token,
          4096
        )
    )
    .filter(Boolean);
}

async function removeInvalidToken(
  uid: string,
  token: string
): Promise<void> {
  try {
    await unregisterPushDevice(
      uid,
      token
    );
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace Push] Failed to remove invalid token:',
      (error as Error)
        ?.message
    );
  }
}

export async function sendPushToUser(
  params: {
    uid: string;

    title: string;

    body: string;

    url?: string;

    tag?: string;

    type?: string;

    topic?: string;
  }
): Promise<PushDeliveryResult> {
  const tokens =
    await getActivePushTokens(
      params.uid
    );

  if (
    tokens.length ===
    0
  ) {
    return {
      attempted:
        0,

      delivered:
        0,

      failed:
        0,

      invalidTokensRemoved:
        0,
    };
  }

  const response =
    await getMessaging()
      .sendEachForMulticast({
        tokens,

        notification: {
          title:
            safeText(
              params.title,
              120
            ) ||
            'MirrorTrace',

          body:
            safeText(
              params.body,
              240
            ) ||
            'A perspective you chose to revisit is ready.',
        },

        data: {
          url:
            safeText(
              params.url,
              500
            ) ||
            '/',

          tag:
            safeText(
              params.tag,
              120
            ) ||
            'mirrortrace-reminder',

          type:
            safeText(
              params.type,
              120
            ) ||
            'perspective_watch_due',

          topic:
            safeText(
              params.topic,
              120
            ),
        },

        webpush: {
          fcmOptions: {
            link:
              safeText(
                params.url,
                500
              ) ||
              '/',
          },

          notification: {
            tag:
              safeText(
                params.tag,
                120
              ) ||
              'mirrortrace-reminder',
          },
        },
      });

  let invalidTokensRemoved =
    0;

  const invalidCodes =
    new Set([
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
      'messaging/invalid-argument',
    ]);

  await Promise.all(
    response.responses.map(
      async (
        result,
        index
      ) => {
        if (
          result.success
        ) {
          return;
        }

        const code =
          result.error
            ?.code ||
          '';

        if (
          invalidCodes.has(
            code
          )
        ) {
          invalidTokensRemoved +=
            1;

          await removeInvalidToken(
            params.uid,
            tokens[index]
          );
        }
      }
    )
  );

  return {
    attempted:
      tokens.length,

    delivered:
      response.successCount,

    failed:
      response.failureCount,

    invalidTokensRemoved,
  };
}

export async function sendPerspectiveWatchPush(
  params: {
    uid: string;

    watchId: string;

    diffId: string;

    topic: string;

    appUrl?: string;
  }
): Promise<PushDeliveryResult> {
  const topic =
    safeText(
      params.topic,
      120
    ) ||
    'Your perspective';

  const configuredAppUrl =
    safeText(
      params.appUrl,
      500
    );

  const url =
    configuredAppUrl
      ? configuredAppUrl
          .replace(
            /\/$/,
            ''
          )
      : '/';

  return sendPushToUser({
    uid:
      params.uid,

    title:
      'MirrorTrace · Perspective Watch',

    body:
      `${topic} is ready to revisit.`,

    url,

    tag:
      `perspective-watch-${params.watchId}`,

    type:
      'perspective_watch_due',

    topic,
  });
}