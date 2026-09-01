import {
  useEffect,
  useState,
} from 'react';

import {
  ShieldCheck,
} from 'lucide-react';

import AdminDashboard from './AdminDashboard.tsx';
import {
  AdminApiError,
  getAdminOverview,
} from '../lib/admin.ts';
import {
  getCurrentIdToken,
} from '../lib/firebase.ts';

import '../styles/mirrortrace-admin-translucent-black.css';

type AvailabilityState =
  | 'checking'
  | 'allowed'
  | 'denied'
  | 'failed';

const ADMIN_HASH =
  '#/admin';

const CONTROL_ROOM_OWNER_EMAIL =
  'agrimalko@gmail.com';

function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const normalized = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      '='
    );

    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((char) =>
          `%${char
            .charCodeAt(0)
            .toString(16)
            .padStart(2, '0')}`
        )
        .join('')
    );

    return JSON.parse(json) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

function isOwnerToken(
  token: string
): boolean {
  const payload =
    decodeJwtPayload(token);

  const email =
    typeof payload?.email ===
    'string'
      ? payload.email
          .trim()
          .toLowerCase()
      : '';

  return (
    payload?.email_verified ===
      true &&
    email ===
      CONTROL_ROOM_OWNER_EMAIL
  );
}

export default function AdminPanelLauncher() {
  const [state, setState] =
    useState<AvailabilityState>(
      'checking'
    );

  const [
    adminPageOpen,
    setAdminPageOpen,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    const verify =
      async () => {
        try {
          const token =
            await getCurrentIdToken();

          if (!active) {
            return;
          }

          if (
            !token ||
            !isOwnerToken(token)
          ) {
            setState('denied');
            setAdminPageOpen(false);

            if (
              window.location.hash ===
              ADMIN_HASH
            ) {
              window.history.replaceState(
                null,
                '',
                '#/overview'
              );
            }

            return;
          }

          const overview =
            await getAdminOverview();

          if (!active) {
            return;
          }

          if (
            overview.role !==
              'super_admin' &&
            overview.role !== 'admin'
          ) {
            setState('denied');
            setAdminPageOpen(false);
            return;
          }

          setState('allowed');
        } catch (error) {
          if (!active) {
            return;
          }

          if (
            error instanceof
              AdminApiError &&
            (error.status === 401 ||
              error.status === 403)
          ) {
            setState('denied');
            setAdminPageOpen(false);

            if (
              window.location.hash ===
              ADMIN_HASH
            ) {
              window.history.replaceState(
                null,
                '',
                '#/overview'
              );
            }

            return;
          }

          console.error(
            '[MirrorTrace Admin] verification failed',
            error
          );
          setState('failed');
        }
      };

    void verify();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const wantsAdmin =
        window.location.hash ===
        ADMIN_HASH;

      if (
        wantsAdmin &&
        state === 'allowed'
      ) {
        setAdminPageOpen(true);
      } else {
        setAdminPageOpen(false);

        if (
          wantsAdmin &&
          state === 'denied'
        ) {
          window.history.replaceState(
            null,
            '',
            '#/overview'
          );
        }
      }
    };

    syncHash();
    window.addEventListener(
      'hashchange',
      syncHash
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        syncHash
      );
    };
  }, [state]);

  useEffect(() => {
    const previous =
      document.body.style.overflow;

    if (adminPageOpen) {
      document.body.style.overflow =
        'hidden';
    } else {
      document.body.style.overflow =
        previous || '';
    }

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [adminPageOpen]);

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
        onClick={() =>
          window.location.reload()
        }
        className="fixed bottom-5 right-5 z-[9000] rounded-full border border-red-400/30 bg-black/80 px-5 py-3 text-sm font-semibold text-red-200 shadow-2xl"
      >
        Admin check failed — retry
      </button>
    );
  }

  if (adminPageOpen) {
    return (
      <div className="mirrortrace-admin-page mirrortrace-admin-overlay fixed inset-0 z-[10000] overflow-x-hidden overflow-y-auto">
        <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AdminDashboard
            onClose={() => {
              setAdminPageOpen(false);
              window.location.hash =
                '#/overview';
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        window.location.hash =
          ADMIN_HASH;
      }}
      className="mirrortrace-admin-launcher fixed bottom-5 right-5 z-[9000]"
      aria-label="Open Admin Control Room"
    >
      <ShieldCheck className="h-4 w-4 shrink-0 text-amber-300" />
      <span>
        Admin Control Room
      </span>
    </button>
  );
}
