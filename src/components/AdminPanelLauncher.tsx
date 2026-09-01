import {
  useEffect,
  useState,
} from 'react';

import {
  ShieldCheck,
} from 'lucide-react';

import {
  auth,
} from '../lib/firebase.ts';

import AdminDashboard from './AdminDashboard.tsx';
import AdminMirrorRoomsPanel from './AdminMirrorRoomsPanel.tsx';

import {
  AdminApiError,
  getAdminOverview,
} from '../lib/admin.ts';


type AvailabilityState =
  | 'checking'
  | 'allowed'
  | 'denied'
  | 'failed';


const ADMIN_HASH =
  '#/admin';


const PRIMARY_ADMIN_EMAIL =
  'agrimalko@gmail.com';


function currentUserLooksLikePrimaryAdmin():
  boolean {
  const email =
    auth.currentUser
      ?.email
      ?.trim()
      .toLowerCase();

  return email ===
    PRIMARY_ADMIN_EMAIL;
}


export default function AdminPanelLauncher() {

  /*
   * IMPORTANT:
   *
   * The authenticated App is already mounted only after Firebase auth has
   * completed, so auth.currentUser is normally available synchronously here.
   *
   * For the known primary admin account we render the launcher immediately
   * instead of waiting for the /api/admin/overview round trip.
   *
   * This is only a UI optimisation.
   * Actual admin authorization is still enforced server-side by requireRole().
   */
  const [
    state,
    setState,
  ] =
    useState<AvailabilityState>(
      () =>
        currentUserLooksLikePrimaryAdmin()
          ? 'allowed'
          : 'checking'
    );


  const [
    adminPageOpen,
    setAdminPageOpen,
  ] =
    useState(
      () =>
        window.location.hash ===
        ADMIN_HASH
    );


  useEffect(() => {

    let active =
      true;


    const checkAdminAccess =
      async () => {

        try {

          const overview =
            await getAdminOverview();


          if (!active) {
            return;
          }


          console.info(
            '[MirrorTrace Admin] Access verified.',
            {
              role:
                overview.role,

              generatedAt:
                overview.generatedAt,
            }
          );


          setState(
            'allowed'
          );

        } catch (error) {

          if (!active) {
            return;
          }


          if (
            error instanceof
            AdminApiError
          ) {

            console.error(
              '[MirrorTrace Admin] Availability check failed.',
              {
                status:
                  error.status,

                code:
                  error.code ??
                  'NO_ERROR_CODE',

                message:
                  error.message,
              }
            );


            if (
              error.status === 401 ||
              error.status === 403
            ) {

              setState(
                'denied'
              );

              return;
            }

          } else {

            console.error(
              '[MirrorTrace Admin] Unexpected availability error.',
              error
            );

          }


          /*
           * If the known admin is already signed in, do not make the launcher
           * disappear just because a transient network request failed.
           * Clicking/opening the admin page will still hit protected server
           * endpoints, so authorization is never weakened.
           */
          if (
            currentUserLooksLikePrimaryAdmin()
          ) {
            setState(
              'allowed'
            );

            return;
          }


          setState(
            'failed'
          );
        }
      };


    void checkAdminAccess();


    return () => {

      active =
        false;

    };

  }, []);


  useEffect(() => {

    const handleHashChange =
      () => {

        const isAdmin =
          window.location.hash ===
          ADMIN_HASH;


        setAdminPageOpen(
          isAdmin
        );


        window.scrollTo({
          top:
            0,

          behavior:
            'auto',
        });
      };


    window.addEventListener(
      'hashchange',
      handleHashChange
    );


    return () => {

      window.removeEventListener(
        'hashchange',
        handleHashChange
      );

    };

  }, []);


  /*
   * Non-admin users never get the launcher.
   *
   * During the very short auth check for an unknown account we also keep the
   * launcher hidden. The known primary admin does not enter this branch because
   * their initial state is already "allowed".
   */
  if (
    state === 'checking' ||
    state === 'denied'
  ) {
    return null;
  }


  if (
    state === 'failed'
  ) {

    return (
      <button
        type="button"

        title="
          Admin backend check failed.
          Open DevTools Console for the exact status.
        "

        onClick={() => {
          window.location.reload();
        }}

        className="
          fixed
          bottom-5
          right-5
          z-[9000]

          rounded-full

          border
          border-red-400/30

          bg-black/80

          px-5
          py-3

          text-sm
          font-semibold
          text-red-200

          shadow-2xl

          transition-all

          hover:-translate-y-0.5
          hover:bg-black/95
        "
      >
        Admin check failed — retry
      </button>
    );
  }


  if (
    adminPageOpen
  ) {

    return (
      <div
        className="
          mirrortrace-admin-page
          mirrortrace-admin-overlay
        "
      >

        <main
          className="
            mx-auto
            min-h-screen
            max-w-[1500px]

            px-4
            py-6

            sm:px-6
            sm:py-8

            lg:px-8
          "
        >

          <AdminDashboard
            onClose={() => {

              window.location.hash =
                '#/overview';

            }}
          />

          <AdminMirrorRoomsPanel />

        </main>

      </div>
    );
  }


  return (
    <button
      type="button"

      onClick={() => {

        window.location.hash =
          '/admin';

      }}

      className="
        mirrortrace-admin-launcher
      "

      aria-label="
        Open Admin Control Room
      "
    >

      <ShieldCheck
        className="
          h-4
          w-4
          shrink-0
          text-amber-300
        "
      />

      <span>
        Admin Control Room
      </span>

    </button>
  );
}
