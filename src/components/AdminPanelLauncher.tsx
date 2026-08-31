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

/*
 * FINAL ADMIN VISUAL AUTHORITY.
 * Imported here so it loads after AdminDashboard's legacy visual imports.
 */
import '../styles/mirrortrace-admin-translucent-black.css';


type AvailabilityState =
  | 'checking'
  | 'allowed'
  | 'denied'
  | 'failed';


const ADMIN_HASH =
  '#/admin';


export default function AdminPanelLauncher() {

  const [
    state,
    setState,
  ] =
    useState<AvailabilityState>(
      'checking'
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


  /*
     Check whether this authenticated user has
     administrative access.
  */

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


  /*
     Treat #/admin like a small client-side page.
  */

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
     Lock the underlying application while the Admin Control Room
     is open. The admin page itself remains independently scrollable.
  */

  useEffect(() => {

    if (!adminPageOpen) {
      return;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      'hidden';


    return () => {

      document.body.style.overflow =
        previousOverflow;

    };

  }, [
    adminPageOpen,
  ]);


  /*
     Hide launcher while checking or when the user
     definitely does not have admin rights.
  */

  if (
    state === 'checking' ||
    state === 'denied'
  ) {
    return null;
  }


  /*
     Backend / network error.
  */

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


  /*
     ADMIN PAGE
  */

  if (
    adminPageOpen
  ) {

    return (
      <div
        className="
          mirrortrace-admin-page
          mirrortrace-admin-overlay

          fixed
          inset-0
          z-[10000]

          overflow-x-hidden
          overflow-y-auto
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

        </main>

      </div>
    );
  }


  /*
     FLOATING BUTTON
     Only administrators see this.
  */

  return (
    <button
      type="button"

      onClick={() => {

        window.location.hash =
          ADMIN_HASH;

      }}

      className="
        mirrortrace-admin-launcher

        fixed
        bottom-5
        right-5
        z-[9000]
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
