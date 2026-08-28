/*
 * MirrorTrace Web Push Service Worker
 *
 * This worker intentionally uses the browser Push API directly
 * for background notification display.
 *
 * Firebase Cloud Messaging still handles token registration and
 * server delivery. The service worker only handles the incoming
 * browser push event and notification interaction.
 *
 * Privacy:
 * Never place journal/reflection content in a push payload.
 */

const DEFAULT_TITLE =
  'MirrorTrace';

const DEFAULT_BODY =
  'A perspective you chose to revisit is ready.';

const DEFAULT_URL =
  '/';

const DEFAULT_TAG =
  'mirrortrace-reminder';

/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener(
  'install',
  (event) => {
    self.skipWaiting();
  }
);

/* ============================================================
   ACTIVATE
   ============================================================ */

self.addEventListener(
  'activate',
  (event) => {
    event.waitUntil(
      self.clients.claim()
    );
  }
);

/* ============================================================
   PUSH
   ============================================================ */

/*
 * This handler is registered immediately during the initial
 * evaluation of the worker script.
 *
 * Chrome requires push handlers to exist during initial worker
 * evaluation. Do not move this inside an async initializer.
 */
self.addEventListener(
  'push',
  (event) => {
    let payload = {};

    try {
      if (event.data) {
        payload =
          event.data.json();
      }
    } catch (error) {
      try {
        payload = {
          notification: {
            body:
              event.data
                ? event.data.text()
                : DEFAULT_BODY,
          },
        };
      } catch {
        payload = {};
      }
    }

    const notification =
      payload.notification ||
      {};

    const data =
      payload.data ||
      {};

    const title =
      notification.title ||
      data.title ||
      DEFAULT_TITLE;

    const body =
      notification.body ||
      data.body ||
      DEFAULT_BODY;

    const targetUrl =
      data.url ||
      DEFAULT_URL;

    const tag =
      data.tag ||
      DEFAULT_TAG;

    const options = {
      body,

      tag,

      renotify:
        false,

      data: {
        url:
          targetUrl,

        type:
          data.type ||
          'mirrortrace_notification',

        topic:
          data.topic ||
          '',
      },
    };

    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options
        )
    );
  }
);

/* ============================================================
   NOTIFICATION CLICK
   ============================================================ */

self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification
        ?.data
        ?.url ||
      DEFAULT_URL;

    event.waitUntil(
      self.clients
        .matchAll({
          type:
            'window',

          includeUncontrolled:
            true,
        })
        .then(
          async (
            clientList
          ) => {
            for (
              const client
              of clientList
            ) {
              try {
                if (
                  'navigate'
                  in client
                ) {
                  await client.navigate(
                    targetUrl
                  );
                }

                if (
                  'focus'
                  in client
                ) {
                  return client.focus();
                }
              } catch {
                // Continue to next matching client.
              }
            }

            if (
              self.clients
                .openWindow
            ) {
              return self.clients
                .openWindow(
                  targetUrl
                );
            }

            return undefined;
          }
        )
    );
  }
);