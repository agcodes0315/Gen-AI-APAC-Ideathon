import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ShieldCheck,
} from 'lucide-react';

import AdminDashboard from './AdminDashboard.tsx';
import AdminMirrorRoomsPanel from './AdminMirrorRoomsPanel.tsx';


type AdminPanelLauncherProps = {
  userEmail:
    string | null;
};


const ADMIN_EMAIL =
  'agrimalko@gmail.com';

const ADMIN_HASH =
  '#/admin';

const VERIFYING_TEXT =
  'Verifying administrator access';


export default function AdminPanelLauncher({
  userEmail,
}: AdminPanelLauncherProps) {

  const normalizedEmail =
    userEmail
      ?.trim()
      .toLowerCase() ??
    '';


  const isAllowedAdmin =
    normalizedEmail ===
    ADMIN_EMAIL;


  /*
   * requestedOpen = the user has clicked Admin Control Room
   *                  (or the URL is already #/admin).
   *
   * dashboardReady = AdminDashboard has finished its own existing
   *                  verification/loading phase.
   *
   * The visible admin page opens ONLY when BOTH are true.
   * This prevents the intermediate
   * "Verifying administrator access..." card from ever being shown.
   */
  const [
    requestedOpen,
    setRequestedOpen,
  ] =
    useState<boolean>(
      () =>
        window.location.hash ===
        ADMIN_HASH
    );


  const [
    dashboardReady,
    setDashboardReady,
  ] =
    useState(false);


  /*
   * AdminDashboard is mounted from the moment the approved admin
   * account is available, but it is kept visually hidden while it
   * performs its EXISTING data/authorization load.
   *
   * We deliberately do not modify AdminDashboard.tsx or any CSS.
   */
  const preloadRef =
    useRef<HTMLDivElement | null>(
      null
    );


  useEffect(
    () => {

      const handleHashChange =
        () => {

          const wantsAdmin =
            window.location.hash ===
            ADMIN_HASH;


          setRequestedOpen(
            wantsAdmin
          );


          if (
            wantsAdmin
          ) {

            window.scrollTo({
              top:
                0,

              left:
                0,

              behavior:
                'auto',
            });

          }

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

    },
    []
  );


  /*
   * If the signed-in account stops being the approved frontend
   * admin account, immediately close the admin hash/page.
   *
   * This is UI visibility only. Your server-side admin role/claim
   * checks remain the actual authorization boundary.
   */
  useEffect(
    () => {

      if (
        !isAllowedAdmin
      ) {

        setDashboardReady(
          false
        );


        if (
          window.location.hash ===
          ADMIN_HASH
        ) {

          window.location.hash =
            '/overview';

        }


        setRequestedOpen(
          false
        );

      }

    },
    [
      isAllowedAdmin,
    ]
  );


  /*
   * Watch the already-mounted AdminDashboard.
   *
   * AdminDashboard currently renders the text:
   *   "Verifying administrator access..."
   * during its loading state.
   *
   * We simply keep that preloaded copy invisible. As soon as that
   * text disappears, the existing AdminDashboard has finished its
   * load (either successfully or with its own existing error state).
   *
   * No CSS is changed.
   * No AdminDashboard JSX is changed.
   * No backend authorization is changed.
   */
  useEffect(
    () => {

      if (
        !isAllowedAdmin
      ) {

        return;

      }


      const host =
        preloadRef.current;


      if (
        !host
      ) {

        return;

      }


      const updateReadyState =
        () => {

          const text =
            host.textContent ??
            '';


          const stillVerifying =
            text.includes(
              VERIFYING_TEXT
            );


          /*
           * The host can briefly be empty before React has committed
           * AdminDashboard. Do not mark it ready until it has content.
           */
          const hasRenderedContent =
            text.trim().length >
            0;


          if (
            hasRenderedContent &&
            !stillVerifying
          ) {

            setDashboardReady(
              true
            );

          } else {

            setDashboardReady(
              false
            );

          }

        };


      updateReadyState();


      const observer =
        new MutationObserver(
          updateReadyState
        );


      observer.observe(
        host,
        {
          childList:
            true,

          subtree:
            true,

          characterData:
            true,
        }
      );


      return () => {

        observer.disconnect();

      };

    },
    [
      isAllowedAdmin,
    ]
  );


  /*
   * Only the approved frontend admin account gets the launcher and
   * the pre-mounted dashboard.
   */
  if (
    !isAllowedAdmin
  ) {

    return null;

  }


  /*
   * visibleOpen is intentionally different from requestedOpen.
   *
   * If the user clicks before AdminDashboard finishes loading,
   * nothing half-loaded is shown. The full page appears immediately
   * after the existing dashboard load completes.
   */
  const visibleOpen =
    requestedOpen &&
    dashboardReady;


  return (
    <>

      {/*
       * PRELOAD HOST
       * ------------
       * Always mounted for the approved admin.
       * Never visible.
       *
       * This is the SAME AdminDashboard instance that will later be
       * revealed; it is not unmounted/re-mounted when the page opens.
       */}
      <div
        ref={
          preloadRef
        }
        aria-hidden={
          !visibleOpen
        }
        className={
          visibleOpen
            ? `
                mirrortrace-admin-page
                mirrortrace-admin-overlay
                fixed
                inset-0
                z-[12000]
                overflow-y-auto
              `
            : `
                fixed
                left-[-100000px]
                top-0
                h-px
                w-px
                overflow-hidden
                pointer-events-none
                opacity-0
              `
        }
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
                '/overview';

            }}
          />

          <AdminMirrorRoomsPanel />

        </main>

      </div>


      {/*
       * Keep the launcher visible until the complete admin page is
       * actually ready to be displayed.
       *
       * Once ready + requested, it disappears at the same render in
       * which the full Control Room becomes visible.
       */}
      {!visibleOpen && (
        <button
          type="button"

          onClick={() => {

            setRequestedOpen(
              true
            );


            if (
              window.location.hash !==
              ADMIN_HASH
            ) {

              window.location.hash =
                '/admin';

            }

          }}

          aria-label="
            Open Admin Control Room
          "

          title={
            dashboardReady
              ? 'Open Admin Control Room'
              : 'Admin Control Room is preparing'
          }

          className="
            mirrortrace-admin-launcher

            fixed
            bottom-5
            right-5
            z-[9000]

            inline-flex
            items-center
            gap-2

            rounded-full

            border
            border-white/15

            bg-black/80

            px-5
            py-3

            text-sm
            font-semibold
            text-white

            shadow-2xl

            transition

            hover:-translate-y-0.5
            hover:bg-black
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
      )}

    </>
  );
}
