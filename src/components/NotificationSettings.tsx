import React, {
  useEffect,
  useState,
} from 'react';

import {
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  Mail,
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

interface NotificationSettingsProps {
  emailAddress?:
    string | null;
}

export const NotificationSettings:
  React.FC<
    NotificationSettingsProps
  > = ({
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
      useState<
        PushPermissionState
      >(
        'default'
      );

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
      testing,
      setTesting,
    ] =
      useState(false);

    const [
      message,
      setMessage,
    ] =
      useState<
        string | null
      >(
        null
      );

    const [
      error,
      setError,
    ] =
      useState<
        string | null
      >(
        null
      );

    useEffect(() => {
      let cancelled =
        false;

      void getPushSubscriptionStatus()
        .then(
          (status) => {
            if (
              cancelled
            ) {
              return;
            }

            setSupported(
              status.supported
            );

            setConfigured(
              status.configured
            );

            setPermission(
              status.permission
            );
          }
        );

      let unsubscribe:
        (() => void) |
        undefined;

      void subscribeToForegroundMessages(
        (
          payload
        ) => {
          const title =
            payload
              .notification
              ?.title ||
            'MirrorTrace';

          const body =
            payload
              .notification
              ?.body ||
            'You received a MirrorTrace reminder.';

          setMessage(
            `${title}: ${body}`
          );
        }
      ).then(
        (cleanup) => {
          unsubscribe =
            cleanup;
        }
      );

      return () => {
        cancelled =
          true;

        unsubscribe?.();
      };
    }, []);

    const handleEnable =
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
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not enable push notifications.'
          );
        } finally {
          setEnabling(
            false
          );
        }
      };

    const handleDisable =
      async () => {
        try {
          setDisabling(
            true
          );

          setError(
            null
          );

          await disablePushNotifications();

          setMessage(
            'Push notifications were disabled for this browser.'
          );
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not disable notifications.'
          );
        } finally {
          setDisabling(
            false
          );
        }
      };

    const handleTest =
      async () => {
        try {
          setTesting(
            true
          );

          setError(
            null
          );

          setMessage(
            null
          );

          await sendTestPushNotification();

          setMessage(
            'Test notification sent. It should arrive on each active registered device.'
          );
        } catch (
          err: unknown
        ) {
          setError(
            (err as Error)
              ?.message ||
              'Could not send the test notification.'
          );
        } finally {
          setTesting(
            false
          );
        }
      };

    const pushEnabled =
      permission ===
      'granted';

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

          {/* Email */}
          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900">
                  <Mail className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-stone-950">
                    Email reminders
                  </h3>

                  <p className="mt-1 text-xs text-stone-500">
                    Sent only when you explicitly enable email on a Perspective Watch.
                  </p>

                  {emailAddress && (
                    <p className="mt-2 text-[11px] font-medium text-stone-700">
                      Signed-in address: {emailAddress}
                    </p>
                  )}
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Opt-in per watch
              </span>
            </div>
          </div>

          {/* Push */}
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
                        Firebase VAPID key required
                      </span>
                    )}

                    {!supported && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600">
                        Unsupported in this browser
                      </span>
                    )}

                    {pushEnabled && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Permission granted
                      </span>
                    )}

                    {permission ===
                      'denied' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
                        <BellOff className="h-3 w-3" />
                        Browser blocked notifications
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">

                {!pushEnabled ? (
                  <button
                    type="button"
                    onClick={() =>
                      void handleEnable()
                    }
                    disabled={
                      enabling ||
                      !supported ||
                      !configured
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enabling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}

                    Enable push
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        void handleTest()
                      }
                      disabled={
                        testing
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
                    >
                      {testing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}

                      Send test
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDisable()
                      }
                      disabled={
                        disabling
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
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