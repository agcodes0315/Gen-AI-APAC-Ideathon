import {
  useEffect,
  useState,
} from 'react';

import AdminDashboard from './AdminDashboard.tsx';

import {
  AdminApiError,
  getAdminOverview,
} from '../lib/admin.ts';

type AvailabilityState =
  | 'checking'
  | 'allowed'
  | 'denied'
  | 'failed';

export default function AdminPanelLauncher() {
  const [state, setState] =
    useState<AvailabilityState>('checking');

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    let active = true;

    const checkAdminAccess = async () => {
      try {
        const overview =
          await getAdminOverview();

        if (!active) return;

        console.info(
          '[MirrorTrace Admin] Access verified.',
          {
            role: overview.role,
            generatedAt: overview.generatedAt,
          }
        );

        setState('allowed');
      } catch (error) {
        if (!active) return;

        if (error instanceof AdminApiError) {
          console.error(
            '[MirrorTrace Admin] Availability check failed.',
            {
              status: error.status,
              code:
                error.code ??
                'NO_ERROR_CODE',
              message: error.message,
            }
          );

          if (
            error.status === 401 ||
            error.status === 403
          ) {
            setState('denied');
            return;
          }
        } else {
          console.error(
            '[MirrorTrace Admin] Unexpected availability error.',
            error
          );
        }

        setState('failed');
      }
    };

    void checkAdminAccess();

    return () => {
      active = false;
    };
  }, []);

  if (
    state === 'checking' ||
    state === 'denied'
  ) {
    return null;
  }

  if (state === 'failed') {
    return (
      <button
        type="button"
        title="Admin backend check failed. Open DevTools Console for the exact status."
        onClick={() => {
          window.location.reload();
        }}
        className="
          fixed bottom-5 right-5 z-[9000]
          rounded-2xl border border-red-400/30
          bg-[#2A1E22]/95 px-4 py-3
          text-sm font-semibold text-[#F1B7B7]
          shadow-2xl backdrop-blur-xl
          transition-all hover:-translate-y-0.5 hover:bg-[#342329]
        "
      >
        Admin check failed — retry
      </button>
    );
  }

  if (open) {
    return (
      <div className="
        mirrortrace-admin-overlay
        fixed inset-0 z-[10000]
        overflow-y-auto
      ">
        <div className="
          max-w-[1500px] mx-auto
          px-4 sm:px-6 lg:px-8
          py-7 sm:py-9
        ">
          <AdminDashboard
            onClose={() => {
              setOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
      }}
      className="
        mirrortrace-admin-launcher
        fixed bottom-5 right-5 z-[9000]
        rounded-2xl
        border border-white/10
        bg-[#12161A]/94
        px-4 py-3
        text-sm font-semibold text-[#ECEFF4]
        shadow-2xl backdrop-blur-xl
        transition-all
        hover:-translate-y-1 hover:border-[#5E81AC]/50 hover:bg-[#1E252B]
      "
    >
      Admin Control Room
    </button>
  );
}
