import '../styles/mirrortrace-clean-glass.css';
import '../styles/mirrortrace-authenticated-haze.css';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

import {
  ArrowDown,
  CircleUserRound,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Star,
} from 'lucide-react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

import {
  AdminApiError,
  getAdminAudit,
  getAdminOverview,
  getAdminUsers,
  type AdminAuditEvent,
  type AdminOverview,
  type AdminUserSummary,
  type HealthState,
} from '../lib/admin.ts';

import {
  getAdminReviews,
  getAdminSupportTickets,
  moderateReview,
  updateAdminSupportTicket,
  type ProductReview,
  type ReviewState,
  type SupportStatus,
  type SupportTicket,
} from '../lib/supportReviews.ts';


interface AdminDashboardProps {
  onClose?: () => void;
}

function stateLabel(
  state:
    HealthState
): string {
  switch (
    state
  ) {
    case 'healthy':
      return 'Healthy';
    case 'configured':
      return 'Configured';
    case 'not_configured':
      return 'Not configured';
    case 'error':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}

function stateClasses(
  state:
    HealthState
): string {
  if (
    state ===
    'healthy'
  ) {
    return 'bg-emerald-500';
  }

  if (
    state ===
    'configured'
  ) {
    return 'bg-blue-500';
  }

  if (
    state ===
    'error'
  ) {
    return 'bg-red-500';
  }

  if (
    state ===
    'not_configured'
  ) {
    return 'bg-amber-500';
  }

  return 'bg-slate-400';
}

function ServiceCard(
  props: {
    label:
      string;
    state:
      HealthState;
    detail?:
      string;
  }
) {
  return (
    <motion.div
      whileHover={{
        y:
          -3,
      }}
      className="rounded-xl border border-stone-200 bg-stone-50 p-4"
    >
      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${stateClasses(
            props.state
          )}`}
        />

        <strong className="text-sm text-stone-900">
          {props.label}
        </strong>

        <span className="ml-auto text-[11px] font-medium text-stone-500">
          {stateLabel(
            props.state
          )}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {props.detail ??
          'No additional information.'}
      </p>
    </motion.div>
  );
}

function DonutChart(
  props: {
    snapshots:
      number;
    diffs:
      number;
    watches:
      number;
  }
) {
  const total =
    props.snapshots +
    props.diffs +
    props.watches;

  const snapshotPercent =
    total > 0
      ? (
          props.snapshots /
          total
        ) * 100
      : 0;

  const diffPercent =
    total > 0
      ? (
          props.diffs /
          total
        ) * 100
      : 0;

  const secondStop =
    snapshotPercent +
    diffPercent;

  const background =
    total === 0
      ? '#e7e5e4'
      : `conic-gradient(
          #d39445 0% ${snapshotPercent}%,
          #6f93ba ${snapshotPercent}% ${secondStop}%,
          #758467 ${secondStop}% 100%
        )`;

  const donutStyle:
    CSSProperties = {
      background,
    };

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-6">

      <motion.div
        initial={{
          rotate:
            -60,
          scale:
            0.9,
          opacity:
            0,
        }}
        whileInView={{
          rotate:
            0,
          scale:
            1,
          opacity:
            1,
        }}
        viewport={{
          once:
            true,
        }}
        className="grid h-40 w-40 place-items-center rounded-full"
        style={
          donutStyle
        }
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
          <div>
            <div className="text-2xl font-bold text-stone-900">
              {total}
            </div>

            <div className="text-[11px] text-stone-500">
              tracked
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />
          Thought Snapshots
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Thought Diffs
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
          Active Watches
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard(
  props:
    AdminDashboardProps
) {
  const reducedMotion =
    useReducedMotion();

  const [
    overview,
    setOverview,
  ] =
    useState<AdminOverview | null>(
      null
    );

  const [
    users,
    setUsers,
  ] =
    useState<AdminUserSummary[]>(
      []
    );

  const [
    audit,
    setAudit,
  ] =
    useState<AdminAuditEvent[]>(
      []
    );

  const [
    support,
    setSupport,
  ] =
    useState<SupportTicket[]>(
      []
    );

  const [
    reviews,
    setReviews,
  ] =
    useState<ProductReview[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    targetFlash,
    setTargetFlash,
  ] =
    useState<string | null>(
      null
    );

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const [
            nextOverview,
            nextUsers,
            nextAudit,
            nextSupport,
            nextReviews,
          ] =
            await Promise.all([
              getAdminOverview(),
              getAdminUsers(),
              getAdminAudit(),
              getAdminSupportTickets()
                .catch(
                  () => []
                ),
              getAdminReviews()
                .catch(
                  () => []
                ),
            ]);

          setOverview(
            nextOverview
          );

          setUsers(
            nextUsers
          );

          setAudit(
            nextAudit
          );

          setSupport(
            nextSupport
          );

          setReviews(
            nextReviews
          );
        } catch (
          caught
        ) {
          if (
            caught instanceof
              AdminApiError &&
            caught.status ===
              403
          ) {
            setError(
              'This account does not have administrative access.'
            );
          } else {
            setError(
              caught instanceof
                Error
                ? caught.message
                : 'The admin dashboard could not be loaded.'
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    void load();
  }, [
    load,
  ]);

  const services =
    useMemo(
      () => {
        if (
          !overview
        ) {
          return [];
        }

        return [
          overview.services
            .firebaseAuth,
          overview.services
            .firestore,
          overview.services
            .gemini,
          overview.services
            .smtp,
          overview.services
            .fcm,
          overview.services
            .scheduler,
        ];
      },
      [
        overview,
      ]
    );

  const scrollToSection =
    (
      id:
        string
    ) => {
      document
        .getElementById(
          id
        )
        ?.scrollIntoView({
          behavior:
            reducedMotion
              ? 'auto'
              : 'smooth',
          block:
            'start',
        });

      setTargetFlash(
        id
      );

      window.setTimeout(
        () => {
          setTargetFlash(
            (
              current
            ) =>
              current ===
              id
                ? null
                : current
          );
        },
        1100
      );
    };

  if (
    loading
  ) {
    return (
      <div className="grid min-h-[70vh] place-items-center">

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">

          <div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            MirrorTrace Control Room
          </div>

          <h1 className="mt-2 text-xl font-semibold text-stone-900">
            Verifying administrator access…
          </h1>
        </div>
      </div>
    );
  }

  if (
    error ||
    !overview
  ) {
    return (
      <div className="grid min-h-[70vh] place-items-center">

        <div className="max-w-xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">

          <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">
            Access Control
          </div>

          <h1 className="mt-2 text-xl font-semibold text-stone-900">
            Admin dashboard unavailable
          </h1>

          <p className="mt-3 text-sm text-stone-600">
            {error ??
              'The dashboard could not be loaded.'}
          </p>

          <div className="mt-5 flex gap-3">

            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>

            {props.onClose && (
              <button
                type="button"
                onClick={
                  props.onClose
                }
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Return
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const metricCards =
    [
      {
        label:
          'Registered users',
        value:
          overview.counts
            .registeredUsers,
        detail:
          'Firebase Auth accounts',
        target:
          'admin-users',
        icon:
          CircleUserRound,
      },
      {
        label:
          'Thought Snapshots',
        value:
          overview.counts
            .thoughtSnapshots,
        detail:
          'Aggregate count only',
        target:
          'admin-activity',
        icon:
          Star,
      },
      {
        label:
          'Thought Diffs',
        value:
          overview.counts
            .thoughtDiffs,
        detail:
          'Aggregate comparison records',
        target:
          'admin-activity',
        icon:
          GitCompareIcon,
      },
      {
        label:
          'Active Watches',
        value:
          overview.counts
            .activePerspectiveWatches,
        detail:
          'Scheduled or due',
        target:
          'admin-health',
        icon:
          RefreshCw,
      },
      {
        label:
          'Push devices',
        value:
          overview.counts
            .pushDevices,
        detail:
          'Registered delivery endpoints',
        target:
          'admin-health',
        icon:
          ShieldCheck,
      },
    ];

  return (
    <section className="mirrortrace-admin-dashboard space-y-6">

      {/* COMMAND HERO */}

      <motion.header
        initial={{
          opacity:
            0,
          y:
            reducedMotion
              ? 0
              : 18,
        }}
        animate={{
          opacity:
            1,
          y:
            0,
        }}
        className="mirrortrace-admin-hero mirrortrace-clean-glass-hero relative overflow-hidden rounded-[30px] p-6 text-white sm:p-8"
      >
<div className="mirrortrace-admin-hero-content relative z-10 flex flex-wrap items-start justify-between gap-5">

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
              MirrorTrace
            </div>

            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl mirrortrace-admin-title-float">
              Security & Operations
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/80 mirrortrace-admin-subtitle-float">
              Operational visibility without private journal visibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <span className="rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-100">
              {overview.role.replace(
                '_',
                ' '
              )}
            </span>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-lg"
            >
              Refresh
            </button>

            {props.onClose && (
              <button
                type="button"
                onClick={
                  props.onClose
                }
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-950"
              >
                Close
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4 backdrop-blur-lg">

          <div>
            <div className="font-semibold text-emerald-100">
              Privacy Boundary Active
            </div>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-emerald-100/60">
              Administrative roles do not grant access to private journal, conversation, Thought Snapshot, Thought Diff, or provenance content.
            </p>
          </div>

          <span className="rounded-full border border-emerald-200/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-emerald-100">
            OWNER-ISOLATED
          </span>
        </div>
      </motion.header>

      {/* CLICKABLE KPI STRIP */}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren:
                reducedMotion
                  ? 0
                  : 0.07,
            },
          },
        }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {metricCards.map(
          (
            card
          ) => {
            const Icon =
              card.icon;

            return (
              <motion.button
                key={
                  card.label
                }
                variants={{
                  hidden: {
                    opacity:
                      0,
                    y:
                      16,
                  },
                  show: {
                    opacity:
                      1,
                    y:
                      0,
                  },
                }}
                whileHover={
                  reducedMotion
                    ? undefined
                    : {
                        y:
                          -6,
                      }
                }
                whileTap={{
                  scale:
                    0.98,
                }}
                type="button"
                onClick={() =>
                  scrollToSection(
                    card.target
                  )
                }
                className="mirrortrace-admin-metric group rounded-[24px] border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                    {card.label}
                  </div>

                  <Icon className="h-4 w-4 text-stone-400 transition-colors group-hover:text-amber-800" />
                </div>

                <div className="mt-2 text-3xl font-bold text-stone-900">
                  {card.value.toLocaleString()}
                </div>

                <div className="mt-1 text-xs text-stone-500">
                  {card.detail}
                </div>

                <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800 opacity-0 transition-opacity group-hover:opacity-100">
                  Jump to section
                  <ArrowDown className="h-3 w-3" />
                </div>
              </motion.button>
            );
          }
        )}
      </motion.div>

      {/* SYSTEM HEALTH */}

      <motion.div
        id="admin-health"
        animate={
          targetFlash ===
          'admin-health'
            ? {
                boxShadow: [
                  '0 0 0 rgba(245,158,11,0)',
                  '0 0 0 5px rgba(245,158,11,0.18)',
                  '0 0 0 rgba(245,158,11,0)',
                ],
              }
            : undefined
        }
        className="grid scroll-mt-6 gap-6 xl:grid-cols-[1.5fr_0.8fr]"
      >
        <article className="mirrortrace-admin-surface rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">

          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            System
          </div>

          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            Service Health
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map(
              (
                service
              ) => (
                <ServiceCard
                  key={
                    service.label
                  }
                  {...service}
                />
              )
            )}
          </div>
        </article>

        <article
          id="admin-activity"
          className="mirrortrace-admin-surface scroll-mt-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            Aggregate activity
          </div>

          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            Reflection Infrastructure
          </h2>

          <DonutChart
            snapshots={
              overview.counts
                .thoughtSnapshots
            }
            diffs={
              overview.counts
                .thoughtDiffs
            }
            watches={
              overview.counts
                .activePerspectiveWatches
            }
          />
        </article>
      </motion.div>

      {/* USERS */}

      <motion.article
        id="admin-users"
        animate={
          targetFlash ===
          'admin-users'
            ? {
                boxShadow: [
                  '0 0 0 rgba(245,158,11,0)',
                  '0 0 0 5px rgba(245,158,11,0.18)',
                  '0 0 0 rgba(245,158,11,0)',
                ],
              }
            : undefined
        }
        className="mirrortrace-admin-surface scroll-mt-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
          Account operations
        </div>

        <h2 className="mt-1 text-lg font-semibold text-stone-900">
          Users
        </h2>

        <p className="mt-1 text-xs text-stone-500">
          Identifiers and emails are minimized. Private reflection content is unavailable here.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[780px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] uppercase tracking-[0.06em] text-stone-500">
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Last sign-in</th>
              </tr>
            </thead>

            <tbody>
              {users.map(
                (
                  user
                ) => (
                  <tr
                    key={
                      user.uid
                    }
                    className="border-b border-stone-100 text-sm text-stone-700"
                  >
                    <td className="px-3 py-3">
                      {user.uid}
                    </td>

                    <td className="px-3 py-3">
                      {user.email ??
                        '—'}
                    </td>

                    <td className="px-3 py-3">
                      {user.role}
                    </td>

                    <td className="px-3 py-3">
                      {user.disabled
                        ? 'Disabled'
                        : 'Active'}
                    </td>

                    <td className="px-3 py-3">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="px-3 py-3">
                      {user.lastSignInAt
                        ? new Date(
                            user.lastSignInAt
                          ).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.article>

      {/* SUPPORT */}

      <motion.article
        id="admin-support"
        className="mirrortrace-admin-surface scroll-mt-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
              Customer operations
            </div>

            <h2 className="mt-1 text-lg font-semibold text-stone-900">
              Support Queue
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Only content explicitly submitted through Customer Support appears here.
            </p>
          </div>

          <MessageSquareText className="h-5 w-5 text-stone-400" />
        </div>

        <div className="mt-4 space-y-3">
          {support.map(
            (
              ticket
            ) => (
              <SupportTicketCard
                key={
                  ticket.id
                }
                ticket={
                  ticket
                }
                onSaved={
                  load
                }
              />
            )
          )}

          {support.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
              No support tickets.
            </div>
          )}
        </div>
      </motion.article>

      {/* REVIEWS */}

      <motion.article
        id="admin-reviews"
        className="mirrortrace-admin-surface scroll-mt-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
              Public feedback
            </div>

            <h2 className="mt-1 text-lg font-semibold text-stone-900">
              Review Moderation
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Public display requires user consent and admin approval.
            </p>
          </div>

          <Star className="h-5 w-5 text-amber-500" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {reviews.map(
            (
              review
            ) => (
              <ReviewModerationCard
                key={
                  review.id
                }
                review={
                  review
                }
                onSaved={
                  load
                }
              />
            )
          )}

          {reviews.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 lg:col-span-2">
              No reviews waiting for moderation.
            </div>
          )}
        </div>
      </motion.article>

      {/* AUDIT */}

      <article
        id="admin-audit"
        className="mirrortrace-admin-surface scroll-mt-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
          Security
        </div>

        <h2 className="mt-1 text-lg font-semibold text-stone-900">
          Admin Audit Log
        </h2>

        <div className="mt-4 space-y-2">
          {audit.map(
            (
              event
            ) => (
              <motion.div
                key={
                  event.id
                }
                initial={{
                  opacity:
                    0,
                  y:
                    8,
                }}
                whileInView={{
                  opacity:
                    1,
                  y:
                    0,
                }}
                viewport={{
                  once:
                    true,
                }}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4"
              >
                <div>
                  <strong className="text-sm text-stone-900">
                    {event.action}
                  </strong>

                  <div className="mt-1 text-xs text-stone-500">
                    {event.actingRole}
                    {' · '}
                    {event.actingUid}
                    {' · '}
                    {event.targetResourceType}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={
                      event.outcome ===
                      'success'
                        ? 'text-xs font-semibold text-emerald-700'
                        : 'text-xs font-semibold text-red-700'
                    }
                  >
                    {event.outcome}
                  </div>

                  <div className="mt-1 text-[10px] text-stone-400">
                    {event.createdAt
                      ? new Date(
                          event.createdAt
                        ).toLocaleString()
                      : 'Pending timestamp'}
                  </div>
                </div>
              </motion.div>
            )
          )}

          {audit.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
              No elevated administrative mutations have been recorded yet.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

/* Small local alias because lucide export name GitCompare is already used conceptually. */
function GitCompareIcon(
  props: {
    className?:
      string;
  }
) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={
        props.className
      }
      aria-hidden="true"
    >
      <path d="M6 3v12" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 6v15" />
      <circle cx="18" cy="3" r="3" />
      <path d="M6 8c5 0 7 4 12 4" />
    </svg>
  );
}

function SupportTicketCard(
  props: {
    ticket:
      SupportTicket;
    onSaved:
      () =>
        Promise<void>;
  }
) {
  const [
    status,
    setStatus,
  ] =
    useState<SupportStatus>(
      props.ticket.status
    );

  const [
    reply,
    setReply,
  ] =
    useState(
      props.ticket
        .adminReply ??
        ''
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const save =
    async () => {
      setSaving(
        true
      );

      try {
        await updateAdminSupportTicket(
          props.ticket.id,
          {
            status,
            adminReply:
              reply,
          }
        );

        await props.onSaved();
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>
          <strong className="text-sm text-stone-900">
            {props.ticket.subject}
          </strong>

          <div className="mt-1 text-[10px] text-stone-500">
            {props.ticket.ownerEmail ??
              props.ticket.ownerUid ??
              'user'}
            {' · '}
            {props.ticket.category}
          </div>
        </div>

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            setStatus(
              event.target
                .value as
                SupportStatus
            )
          }
          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
        >
          <option value="open">
            open
          </option>
          <option value="in_progress">
            in_progress
          </option>
          <option value="resolved">
            resolved
          </option>
          <option value="closed">
            closed
          </option>
        </select>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-stone-700">
        {props.ticket.message}
      </p>

      <textarea
        value={
          reply
        }
        onChange={(
          event
        ) =>
          setReply(
            event.target.value
          )
        }
        rows={3}
        maxLength={
          5000
        }
        className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
        placeholder="Reply to this ticket"
      />

      <button
        type="button"
        onClick={() =>
          void save()
        }
        disabled={
          saving
        }
        className="mt-3 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {saving
          ? 'Saving…'
          : 'Save ticket'}
      </button>
    </div>
  );
}

function ReviewModerationCard(
  props: {
    review:
      ProductReview;
    onSaved:
      () =>
        Promise<void>;
  }
) {
  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const changeState =
    async (
      state:
        ReviewState
    ) => {
      setSaving(
        true
      );

      try {
        await moderateReview(
          props.review.id,
          {
            moderationState:
              state,
            adminResponse:
              props.review
                .adminResponse ??
              '',
          }
        );

        await props.onSaved();
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">

      <div className="flex items-center justify-between gap-3">

        <div className="text-amber-500">
          {'★'.repeat(
            Math.max(
              1,
              Math.min(
                5,
                props.review.rating
              )
            )
          )}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          {props.review.moderationState}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-700">
        {props.review.reviewText}
      </p>

      <div className="mt-3 text-[10px] text-stone-500">
        Public consent:{' '}
        {props.review.allowPublic
          ? 'Yes'
          : 'No'}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">

        {/* Once approved, the Approve action is intentionally removed. */}
        {props.review.moderationState !==
          'approved' && (
          <button
            type="button"
            disabled={
              saving ||
              !props.review
                .allowPublic
            }
            onClick={() =>
              void changeState(
                'approved'
              )
            }
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Approve
          </button>
        )}

        <button
          type="button"
          disabled={
            saving
          }
          onClick={() =>
            void changeState(
              'hidden'
            )
          }
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700"
        >
          Hide
        </button>

        <button
          type="button"
          disabled={
            saving
          }
          onClick={() =>
            void changeState(
              'rejected'
            )
          }
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
