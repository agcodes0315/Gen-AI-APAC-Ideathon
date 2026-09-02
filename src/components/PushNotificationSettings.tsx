import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from 'lucide-react';

import {
  disablePushNotifications,
  enablePushNotifications,
  getPushSubscriptionStatus,
  sendTestPushNotification,
  subscribeToForegroundMessages,
  type PushPermissionState,
} from '../lib/notifications.ts';

import {
  getEmailStatus,
  sendTestEmail,
  verifyEmailConnection,
} from '../lib/emailNotifications.ts';

interface PushNotificationSettingsProps {
  emailAddress?: string | null;
}

async function showForegroundSystemNotification(
  title: string,
  body: string,
  data?: {
    url?: string;
    type?: string;
    topic?: string;
    tag?: string;
  }
): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.ready;

    await registration.showNotification(
      title,
      {
        body,

        tag:
          data?.tag ||
          'mirrortrace-foreground',

        data: {
          url:
            data?.url ||
            '/',

          type:
            data?.type ||
            'mirrortrace_notification',

          topic:
            data?.topic ||
            '',
        },
      }
    );
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace] Foreground notification display failed:',
      error
    );
  }
}

export const PushNotificationSettings:
  React.FC<PushNotificationSettingsProps> = ({
    emailAddress,
  }) => {
    const [
      supported,
      setSupported,
    ] =
      useState(false);

    const [
      configured,
      setConfigured,
    ] =
      useState(false);

    const [
      permission,
      setPermission,
    ] =
      useState<PushPermissionState>(
        'default'
      );

    const [
      registeredDevices,
      setRegisteredDevices,
    ] =
      useState(0);

    const [
      loadingStatus,
      setLoadingStatus,
    ] =
      useState(true);

    const [
      enabling,
      setEnabling,
    ] =
      useState(false);

    const [
      disabling,
      setDisabling,
    ] =
      useState(false);

    const [
      testingPush,
      setTestingPush,
    ] =
      useState(false);

    const [
      emailConfigured,
      setEmailConfigured,
    ] =
      useState(false);

    const [
      checkingEmail,
      setCheckingEmail,
    ] =
      useState(true);

    const [
      verifyingEmail,
      setVerifyingEmail,
    ] =
      useState(false);

    const [
      testingEmail,
      setTestingEmail,
    ] =
      useState(false);

    const [
      message,
      setMessage,
    ] =
      useState<string | null>(
        null
      );

    const [
      error,
      setError,
    ] =
      useState<string | null>(
        null
      );

    const lastForegroundMessageAt =
      useRef(0);

    const refreshPushStatus =
      useCallback(
        async () => {
          try {
            setLoadingStatus(
              true
            );

            const status =
              await getPushSubscriptionStatus();

            setSupported(
              status.supported
            );

            setConfigured(
              status.configured
            );

            setPermission(
              status.permission
            );

            setRegisteredDevices(
              status.registeredDevices
            );
          } catch (
            err: unknown
          ) {
            console.error(
              '[MirrorTrace] Push status refresh failed:',
              err
            );
          } finally {
            setLoadingStatus(
              false
            );
          }
        },
        []
      );

    const refreshEmailStatus =
      useCallback(
        async () => {
          try {
            setCheckingEmail(
              true
            );

            const status =
              await getEmailStatus();

            setEmailConfigured(
              status.configured
            );
          } catch (
            err: unknown
          ) {
            console.warn(
              '[MirrorTrace] Email status refresh failed:',
              err
            );

            setEmailConfigured(
              false
            );
          } finally {
            setCheckingEmail(
              false
            );
          }
        },
        []
      );

    const refreshAll =
      useCallback(
        async () => {
          await Promise.all([
            refreshPushStatus(),
            refreshEmailStatus(),
          ]);
        },
        [
          refreshPushStatus,
          refreshEmailStatus,
        ]
      );

    useEffect(() => {
      void refreshAll();

      let unsubscribe:
        (() => void) |
        undefined;

      void subscribeToForegroundMessages(
        (
          payload
        ) => {
          lastForegroundMessageAt.current =
            Date.now();

          const title =
            payload.notification
              ?.title ||
            payload.data
              ?.title ||
            'MirrorTrace';

          const body =
            payload.notification
              ?.body ||
            payload.data
              ?.body ||
            'A MirrorTrace reminder is ready.';

          setMessage(
            `${title}: ${body}`
          );

          void showForegroundSystemNotification(
            title,
            body,
            {
              url:
                payload.data
                  ?.url ||
                '/',

              type:
                payload.data
                  ?.type ||
                'mirrortrace_notification',

              topic:
                payload.data
                  ?.topic ||
                '',

              tag:
                payload.data
                  ?.tag ||
                'mirrortrace-foreground',
            }
          );
        }
      ).then(
        (
          cleanup
        ) => {
          unsubscribe =
            cleanup;
        }
      );

      return () => {
        unsubscribe?.();
      };
    }, [
      refreshAll,
    ]);

    const handleEnablePush =
      async () => {
        try {
          setEnabling(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          const result =
            await enablePushNotifications();

          setPermission(
            result.permission
          );

          setRegisteredDevices(
            result.registeredDevices
          );

          if (
            result.success
          ) {
            setMessage(
              result.message
            );
          } else {
            setError(
              result.message
            );
          }

          await refreshPushStatus();
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not register this device.'
          );
        } finally {
          setEnabling(
            false
          );
        }
      };

    const handleDisablePush =
      async () => {
        try {
          setDisabling(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          await disablePushNotifications();

          await refreshPushStatus();

          setMessage(
            'This browser was removed from MirrorTrace push delivery.'
          );
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not disable this device.'
          );
        } finally {
          setDisabling(
            false
          );
        }
      };

    const handleTestPush =
      async () => {
        try {
          setTestingPush(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          const testStartedAt =
            Date.now();

          await sendTestPushNotification();

          setMessage(
            'Test push accepted. Waiting for Firebase delivery...'
          );

          window.setTimeout(
            () => {
              if (
                lastForegroundMessageAt.current <
                testStartedAt
              ) {
                void showForegroundSystemNotification(
                  'MirrorTrace notifications are ready',
                  'Your device can receive Perspective Watch reminders.',
                  {
                    url:
                      '/',

                    type:
                      'notification_test',

                    topic:
                      'Notification test',

                    tag:
                      'mirrortrace-local-test',
                  }
                );

                setMessage(
                  'Backend push succeeded. A local notification display test was also triggered.'
                );
              }
            },
            2000
          );
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not send the test push notification.'
          );

          await refreshPushStatus();
        } finally {
          setTestingPush(
            false
          );
        }
      };

    const handleVerifyEmail =
      async () => {
        try {
          setVerifyingEmail(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          await verifyEmailConnection();

          setEmailConfigured(
            true
          );

          setMessage(
            'SMTP connection verified successfully.'
          );
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not verify SMTP connection.'
          );
        } finally {
          setVerifyingEmail(
            false
          );
        }
      };

    const handleTestEmail =
      async () => {
        try {
          setTestingEmail(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          const result =
            await sendTestEmail();

          if (
            result.success
          ) {
            setMessage(
              'Test email sent. Check your signed-in inbox.'
            );
          } else {
            setError(
              'The email server responded but did not confirm delivery.'
            );
          }
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not send the test email.'
          );
        } finally {
          setTestingEmail(
            false
          );
        }
      };

    const browserPermissionGranted =
      permission ===
      'granted';

    const deviceRegistered =
      registeredDevices >
      0;

    return (
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">

        <div className="border-b border-stone-200 px-5 py-5 sm:px-6">

          <div className="flex items-center gap-2">

            <Bell className="h-5 w-5 text-amber-800" />

            <h2 className="font-serif text-lg font-bold text-stone-950">
              Reminder Delivery
            </h2>
          </div>

          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone-500">
            Choose how MirrorTrace can bring a Perspective Watch back to you.
            Notifications contain only safe topic-level context and never your
            private journal text.
          </p>
        </div>

        <div className="divide-y divide-stone-200">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900">

                  <Mail className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-stone-950">
                    Email reminders
                  </h3>

                  <p className="mt-1 max-w-xl text-xs text-stone-500">
                    Email is sent only for Perspective Watches where you
                    explicitly opt in.
                  </p>

                  {emailAddress && (
                    <p className="mt-2 text-[11px] font-medium text-stone-700">
                      Signed-in address: {emailAddress}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">

                      <ShieldCheck className="h-3 w-3" />

                      Opt-in per watch
                    </span>

                    {checkingEmail ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600">

                        <Loader2 className="h-3 w-3 animate-spin" />

                        Checking SMTP
                      </span>
                    ) : emailConfigured ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">

                        <CheckCircle2 className="h-3 w-3" />

                        SMTP configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900">

                        <TriangleAlert className="h-3 w-3" />

                        SMTP unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    void handleVerifyEmail()
                  }
                  disabled={
                    verifyingEmail
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
                >
                  {verifyingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}

                  Verify SMTP
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleTestEmail()
                  }
                  disabled={
                    testingEmail ||
                    !emailConfigured
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {testingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  Send test email
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-800">

                  <Smartphone className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-stone-950">
                    Phone & browser push
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
                    Register this browser or phone so Perspective Watch reminders
                    can appear even when MirrorTrace is not currently open.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {!configured && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900">

                        <TriangleAlert className="h-3 w-3" />

                        VAPID key required
                      </span>
                    )}

                    {browserPermissionGranted && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">

                        <CheckCircle2 className="h-3 w-3" />

                        Browser permission granted
                      </span>
                    )}

                    {browserPermissionGranted &&
                      !deviceRegistered && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900">

                        <TriangleAlert className="h-3 w-3" />

                        Device not registered yet
                      </span>
                    )}

                    {deviceRegistered && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">

                        <Smartphone className="h-3 w-3" />

                        {registeredDevices}{' '}
                        registered{' '}
                        {registeredDevices ===
                        1
                          ? 'device'
                          : 'devices'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">

                {!deviceRegistered && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleEnablePush()
                    }
                    disabled={
                      enabling ||
                      !supported ||
                      !configured
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {enabling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}

                    {browserPermissionGranted
                      ? 'Register this device'
                      : 'Enable push'}
                  </button>
                )}

                {deviceRegistered && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        void handleTestPush()
                      }
                      disabled={
                        testingPush
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {testingPush ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}

                      Send test
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDisablePush()
                      }
                      disabled={
                        disabling
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 disabled:opacity-50"
                    >
                      {disabling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}

                      Disable
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void refreshAll()
                  }
                  disabled={
                    loadingStatus ||
                    checkingEmail
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={
                      loadingStatus ||
                      checkingEmail
                        ? 'h-4 w-4 animate-spin'
                        : 'h-4 w-4'
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {(message ||
          error) && (
          <div className="border-t border-stone-200 px-5 py-4 sm:px-6">

            {message && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">

                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

                <p className="text-xs font-medium leading-relaxed text-emerald-800">
                  {message}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">

                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

                <p className="text-xs font-medium leading-relaxed text-red-700">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };
