import {
  useEffect,
  useState,
} from 'react';

import {
  ShieldCheck,
} from 'lucide-react';

import AdminDashboard from './AdminDashboard.tsx';
import AdminMirrorRoomsPanel from './AdminMirrorRoomsPanel.tsx';

import '../styles/mirrortrace-admin-translucent-black.css';


type AdminPanelLauncherProps = {
  userEmail:
    string | null;
};


const ADMIN_EMAIL =
  'agrimalko@gmail.com';

const ADMIN_HASH =
  '#/admin';


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


  const [
    adminPageOpen,
    setAdminPageOpen,
  ] =
    useState<boolean>(
      () =>
        window.location.hash ===
        ADMIN_HASH
    );


  /*
   * The authenticated user is already resolved by App.tsx.
   * We intentionally do NOT read auth.currentUser here and do NOT wait
   * for a second API request before showing the button.
   *
   * That removes the race which caused the Admin Control Room button
   * to appear late or not appear at all.
   */
  useEffect(
    () => {

      const handleHashChange =
        () => {

          const isAdminHash =
            window.location.hash ===
            ADMIN_HASH;


          setAdminPageOpen(
            isAdminHash
          );


          if (
            isAdminHash
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
   * If the account changes while the admin page is open, remove admin
   * presentation immediately unless it is the one explicitly allowed email.
   */
  useEffect(
    () => {

      if (
        !isAllowedAdmin &&
        adminPageOpen
      ) {

        window.location.hash =
          '/overview';

        setAdminPageOpen(
          false
        );

      }

    },
    [
      isAllowedAdmin,
      adminPageOpen,
    ]
  );


  /*
   * Only agrimalko@gmail.com gets the launcher at all.
   *
   * IMPORTANT:
   * This controls UI visibility only.
   * Existing requireRole(...) server checks remain the real authorization
   * boundary for every admin API endpoint.
   */
  if (
    !isAllowedAdmin
  ) {

    return null;

  }


  /*
   * Keep the ORIGINAL admin dashboard presentation.
   *
   * No new opaque full-screen background is introduced here.
   * The existing mirrortrace-admin-translucent-black.css is restored,
   * which brings back the earlier black/translucent appearance.
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
          z-[12000]
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
                '/overview';

            }}
          />

          <AdminMirrorRoomsPanel />

        </main>

      </div>
    );

  }


  /*
   * MirrorRoom uses bottom-20/right-5.
   * Admin Control Room therefore sits directly below it at bottom-5/right-5.
   */
  return (
    <button
      type="button"

      onClick={() => {

        window.location.hash =
          '/admin';

      }}

      aria-label="
        Open Admin Control Room
      "

      title="
        Open Admin Control Room
      "

      className="
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
  );
}
