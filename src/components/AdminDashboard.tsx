import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

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

interface AdminDashboardProps {
  onClose?: () => void;
}

function stateLabel(state: HealthState): string {
  switch (state) {
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

function stateClasses(state: HealthState): string {
  if (state === 'healthy') return 'bg-emerald-500';
  if (state === 'configured') return 'bg-blue-500';
  if (state === 'error') return 'bg-red-500';
  if (state === 'not_configured') return 'bg-amber-500';
  return 'bg-slate-400';
}

function MetricCard(props: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {props.label}
      </div>

      <div className="mt-2 text-3xl font-bold text-stone-900">
        {props.value.toLocaleString()}
      </div>

      <div className="mt-1 text-xs text-stone-500">
        {props.detail}
      </div>
    </div>
  );
}

function ServiceCard(props: {
  label: string;
  state: HealthState;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
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
          {stateLabel(props.state)}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {props.detail ?? 'No additional information.'}
      </p>
    </div>
  );
}

function DonutChart(props: {
  snapshots: number;
  diffs: number;
  watches: number;
}) {
  const total =
    props.snapshots +
    props.diffs +
    props.watches;

  const snapshotPercent =
    total > 0
      ? (props.snapshots / total) * 100
      : 0;

  const diffPercent =
    total > 0
      ? (props.diffs / total) * 100
      : 0;

  const secondStop =
    snapshotPercent + diffPercent;

  const background =
    total === 0
      ? '#e7e5e4'
      : `conic-gradient(
          #a16207 0% ${snapshotPercent}%,
          #2563eb ${snapshotPercent}% ${secondStop}%,
          #0f766e ${secondStop}% 100%
        )`;

  const donutStyle: CSSProperties = {
    background,
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-6">
      <div
        className="grid h-40 w-40 place-items-center rounded-full"
        style={donutStyle}
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
      </div>

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
  props: AdminDashboardProps
) {
  const [overview, setOverview] =
    useState<AdminOverview | null>(null);

  const [users, setUsers] =
    useState<AdminUserSummary[]>([]);

  const [audit, setAudit] =
    useState<AdminAuditEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        nextOverview,
        nextUsers,
        nextAudit,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminAudit(),
      ]);

      setOverview(nextOverview);
      setUsers(nextUsers);
      setAudit(nextAudit);
    } catch (caught) {
      if (
        caught instanceof AdminApiError &&
        caught.status === 403
      ) {
        setError(
          'This account does not have administrative access.'
        );
      } else {
        setError(
          caught instanceof Error
            ? caught.message
            : 'The admin dashboard could not be loaded.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const services = useMemo(() => {
    if (!overview) return [];

    return [
      overview.services.firebaseAuth,
      overview.services.firestore,
      overview.services.gemini,
      overview.services.smtp,
      overview.services.fcm,
      overview.services.scheduler,
    ];
  }, [overview]);

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
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

  if (error || !overview) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="max-w-xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">
            Access Control
          </div>

          <h1 className="mt-2 text-xl font-semibold text-stone-900">
            Admin dashboard unavailable
          </h1>

          <p className="mt-3 text-sm text-stone-600">
            {error ?? 'The dashboard could not be loaded.'}
          </p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void load()}
            >
              Retry
            </button>

            {props.onClose && (
              <button
                type="button"
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                onClick={props.onClose}
              >
                Return
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            MirrorTrace
          </div>

          <h1 className="mt-1 text-2xl font-serif font-bold text-stone-900">
            Security & Operations
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Operational visibility without private journal visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-800">
            {overview.role.replace('_', ' ')}
          </span>

          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
          >
            Refresh
          </button>

          {props.onClose && (
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
            >
              Close
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div>
          <div className="font-semibold text-emerald-900">
            Privacy Boundary Active
          </div>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-emerald-800">
            Administrative roles do not grant access to private journal,
            conversation, Thought Snapshot, Thought Diff, or provenance content.
          </p>
        </div>

        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-emerald-800">
          OWNER-ISOLATED
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Registered users"
          value={overview.counts.registeredUsers}
          detail="Firebase Auth accounts"
        />

        <MetricCard
          label="Thought Snapshots"
          value={overview.counts.thoughtSnapshots}
          detail="Aggregate count only"
        />

        <MetricCard
          label="Thought Diffs"
          value={overview.counts.thoughtDiffs}
          detail="Aggregate comparison records"
        />

        <MetricCard
          label="Active Watches"
          value={overview.counts.activePerspectiveWatches}
          detail="Scheduled or due"
        />

        <MetricCard
          label="Push devices"
          value={overview.counts.pushDevices}
          detail="Registered delivery endpoints"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            System
          </div>

          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            Service Health
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceCard
                key={service.label}
                {...service}
              />
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
            Aggregate activity
          </div>

          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            Reflection Infrastructure
          </h2>

          <DonutChart
            snapshots={overview.counts.thoughtSnapshots}
            diffs={overview.counts.thoughtDiffs}
            watches={overview.counts.activePerspectiveWatches}
          />
        </article>
      </div>

      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
          Account operations
        </div>

        <h2 className="mt-1 text-lg font-semibold text-stone-900">
          Users
        </h2>

        <p className="mt-1 text-xs text-stone-500">
          Identifiers and emails are minimized. Private reflection content
          is unavailable here.
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
              {users.map((user) => (
                <tr
                  key={user.uid}
                  className="border-b border-stone-100 text-sm text-stone-700"
                >
                  <td className="px-3 py-3">{user.uid}</td>
                  <td className="px-3 py-3">{user.email ?? '—'}</td>
                  <td className="px-3 py-3">{user.role}</td>
                  <td className="px-3 py-3">
                    {user.disabled ? 'Disabled' : 'Active'}
                  </td>
                  <td className="px-3 py-3">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-3">
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
          Security
        </div>

        <h2 className="mt-1 text-lg font-semibold text-stone-900">
          Admin Audit Log
        </h2>

        <div className="mt-4 space-y-2">
          {audit.map((event) => (
            <div
              key={event.id}
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
                    event.outcome === 'success'
                      ? 'text-xs font-semibold text-emerald-700'
                      : 'text-xs font-semibold text-red-700'
                  }
                >
                  {event.outcome}
                </div>

                <div className="mt-1 text-[10px] text-stone-400">
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleString()
                    : 'Pending timestamp'}
                </div>
              </div>
            </div>
          ))}

          {audit.length === 0 && (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
              No elevated administrative mutations have been recorded yet.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
