import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';

import {
  app,
  getCurrentIdToken,
} from './firebase.ts';

export type PushPermissionState =
  | 'unsupported'
  | 'default'
  | 'denied'
  | 'granted';

export interface PushRegistrationResult {
  success: boolean;

  permission:
    PushPermissionState;

  token?: string;

  message: string;
}

export interface PushSubscriptionStatus {
  supported: boolean;

  permission:
    PushPermissionState;

  configured: boolean;
}

const SERVICE_WORKER_PATH =
  '/firebase-messaging-sw.js';

const SERVICE_WORKER_SCOPE =
  '/';

function getVapidKey():
  string {
  return String(
    import.meta.env
      .VITE_FIREBASE_VAPID_KEY ||
      ''
  ).trim();
}

/* ============================================================
   FIREBASE MESSAGING
   ============================================================ */

async function getMessagingIfSupported():
  Promise<Messaging | null> {
  if (
    typeof window ===
      'undefined' ||
    !(
      'Notification'
      in window
    ) ||
    !(
      'serviceWorker'
      in navigator
    )
  ) {
    return null;
  }

  const supported =
    await isSupported()
      .catch(
        () => false
      );

  if (!supported) {
    return null;
  }

  try {
    return getMessaging(
      app
    );
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace] Firebase Messaging initialization failed:',
      error
    );

    return null;
  }
}

/* ============================================================
   SERVICE WORKER
   ============================================================ */

function waitForWorkerState(
  worker:
    ServiceWorker
): Promise<void> {
  if (
    worker.state ===
      'activated'
  ) {
    return Promise.resolve();
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const timeout =
        window.setTimeout(
          () => {
            reject(
              new Error(
                'MirrorTrace notification worker did not activate in time.'
              )
            );
          },
          15000
        );

      const handleStateChange =
        () => {
          if (
            worker.state ===
              'activated'
          ) {
            window.clearTimeout(
              timeout
            );

            worker.removeEventListener(
              'statechange',
              handleStateChange
            );

            resolve();
          }

          if (
            worker.state ===
              'redundant'
          ) {
            window.clearTimeout(
              timeout
            );

            worker.removeEventListener(
              'statechange',
              handleStateChange
            );

            reject(
              new Error(
                'MirrorTrace notification worker became redundant before activation.'
              )
            );
          }
        };

      worker.addEventListener(
        'statechange',
        handleStateChange
      );
    }
  );
}

async function waitForRegistrationActive(
  registration:
    ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  if (
    registration.active
  ) {
    return registration;
  }

  const worker =
    registration.installing ||
    registration.waiting;

  if (worker) {
    await waitForWorkerState(
      worker
    );
  }

  /*
   * Give the browser a chance to promote the worker
   * from waiting/installing -> active.
   */
  for (
    let attempt = 0;
    attempt < 30;
    attempt += 1
  ) {
    if (
      registration.active
    ) {
      return registration;
    }

    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          100
        )
    );
  }

  throw new Error(
    'MirrorTrace service worker is installed but is not active yet. Reload the page once and try again.'
  );
}

async function registerMessagingServiceWorker():
  Promise<ServiceWorkerRegistration> {
  if (
    !(
      'serviceWorker'
      in navigator
    )
  ) {
    throw new Error(
      'Service workers are not supported in this browser.'
    );
  }

  /*
   * Registering the same URL updates an existing worker
   * instead of creating unrelated registrations.
   */
  const registration =
    await navigator
      .serviceWorker
      .register(
        SERVICE_WORKER_PATH,
        {
          scope:
            SERVICE_WORKER_SCOPE,

          updateViaCache:
            'none',
        }
      );

  /*
   * Force Chrome to inspect the new worker file rather than
   * continuing to use an older development copy.
   */
  await registration
    .update()
    .catch(
      () => undefined
    );

  return waitForRegistrationActive(
    registration
  );
}

/* ============================================================
   AUTHENTICATED NOTIFICATION API
   ============================================================ */

async function authenticatedRequest(
  url: string,

  options:
    RequestInit = {}
): Promise<
  Record<
    string,
    unknown
  >
> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new Error(
      'Please sign in before managing notifications.'
    );
  }

  const headers =
    new Headers(
      options.headers ||
        {}
    );

  headers.set(
    'Authorization',
    `Bearer ${token}`
  );

  if (
    options.body
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const response =
    await fetch(
      url,
      {
        ...options,

        headers,
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok
  ) {
    const payload =
      data as Record<
        string,
        unknown
      >;

    throw new Error(
      String(
        payload.message ||
          payload.error ||
          'Notification request failed.'
      )
    );
  }

  return data as Record<
    string,
    unknown
  >;
}

/* ============================================================
   STATUS
   ============================================================ */

export async function getPushSubscriptionStatus():
  Promise<PushSubscriptionStatus> {
  const vapidKey =
    getVapidKey();

  const messaging =
    await getMessagingIfSupported();

  if (!messaging) {
    return {
      supported:
        false,

      permission:
        'unsupported',

      configured:
        Boolean(
          vapidKey
        ),
    };
  }

  return {
    supported:
      true,

    permission:
      Notification.permission,

    configured:
      Boolean(
        vapidKey
      ),
  };
}

/* ============================================================
   ENABLE
   ============================================================ */

export async function enablePushNotifications():
  Promise<PushRegistrationResult> {
  const vapidKey =
    getVapidKey();

  if (!vapidKey) {
    return {
      success:
        false,

      permission:
        typeof Notification !==
        'undefined'
          ? Notification.permission
          : 'unsupported',

      message:
        'Firebase Web Push is not configured. Add VITE_FIREBASE_VAPID_KEY first.',
    };
  }

  const messaging =
    await getMessagingIfSupported();

  if (!messaging) {
    return {
      success:
        false,

      permission:
        'unsupported',

      message:
        'Push notifications are not supported in this browser or device context.',
    };
  }

  let permission =
    Notification.permission;

  if (
    permission ===
      'default'
  ) {
    permission =
      await Notification
        .requestPermission();
  }

  if (
    permission !==
      'granted'
  ) {
    return {
      success:
        false,

      permission,

      message:
        permission ===
        'denied'
          ? 'Notifications are blocked for MirrorTrace in this browser.'
          : 'Notification permission was not granted.',
    };
  }

  let registration:
    ServiceWorkerRegistration;

  try {
    registration =
      await registerMessagingServiceWorker();
  } catch (
    error: unknown
  ) {
    return {
      success:
        false,

      permission:
        'granted',

      message:
        (error as Error)
          ?.message ||
        'MirrorTrace could not activate its notification service worker.',
    };
  }

  if (
    !registration.active
  ) {
    return {
      success:
        false,

      permission:
        'granted',

      message:
        'The notification worker is not active yet. Reload MirrorTrace once and try again.',
    };
  }

  let token:
    string;

  try {
    token =
      await getToken(
        messaging,
        {
          vapidKey,

          serviceWorkerRegistration:
            registration,
        }
      );
  } catch (
    error: unknown
  ) {
    console.error(
      '[MirrorTrace] FCM token creation failed:',
      error
    );

    return {
      success:
        false,

      permission:
        'granted',

      message:
        (error as Error)
          ?.message ||
        'Firebase could not create a push subscription for this device.',
    };
  }

  if (!token) {
    return {
      success:
        false,

      permission:
        'granted',

      message:
        'Firebase did not return a notification token for this device.',
    };
  }

  await authenticatedRequest(
    '/api/notifications/push/register',
    {
      method:
        'POST',

      body:
        JSON.stringify({
          token,

          platform:
            navigator.platform ||
            'web',

          userAgent:
            navigator.userAgent,

          timezone:
            Intl
              .DateTimeFormat()
              .resolvedOptions()
              .timeZone,
        }),
    }
  );

  return {
    success:
      true,

    permission:
      'granted',

    token,

    message:
      'Push notifications are enabled on this device.',
  };
}

/* ============================================================
   DISABLE
   ============================================================ */

export async function disablePushNotifications():
  Promise<void> {
  const messaging =
    await getMessagingIfSupported();

  if (!messaging) {
    return;
  }

  const vapidKey =
    getVapidKey();

  if (!vapidKey) {
    return;
  }

  try {
    const registration =
      await registerMessagingServiceWorker();

    const token =
      await getToken(
        messaging,
        {
          vapidKey,

          serviceWorkerRegistration:
            registration,
        }
      );

    if (token) {
      await authenticatedRequest(
        '/api/notifications/push/unregister',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              token,
            }),
        }
      ).catch(
        () => undefined
      );
    }

    await deleteToken(
      messaging
    );
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace] Push notification cleanup failed:',
      error
    );
  }
}

/* ============================================================
   TEST
   ============================================================ */

export async function sendTestPushNotification():
  Promise<void> {
  await authenticatedRequest(
    '/api/notifications/push/test',
    {
      method:
        'POST',
    }
  );
}

/* ============================================================
   FOREGROUND DELIVERY
   ============================================================ */

export async function subscribeToForegroundMessages(
  callback: (
    payload:
      MessagePayload
  ) => void
): Promise<
  () => void
> {
  const messaging =
    await getMessagingIfSupported();

  if (!messaging) {
    return () =>
      undefined;
  }

  return onMessage(
    messaging,
    callback
  );
}