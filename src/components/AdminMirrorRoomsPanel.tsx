import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  LockKeyhole,
  RefreshCw,
  Users,
} from 'lucide-react';

import {
  getAdminMirrorRooms,
  type AdminMirrorRoomAnalytics,
  type AdminMirrorRoomRow,
} from '../lib/adminMirrorRooms.ts';

function displayIdentity(
  identity: {
    uid:
      string;

    email:
      string | null;
  }
): string {
  return (
    identity.email ||
    identity.uid
  );
}

function statusClasses(
  status:
    AdminMirrorRoomRow['status']
): string {
  return status ===
    'active'
    ? 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200'
    : 'border-stone-400/20 bg-white/5 text-white/55';
}

function formatDate(
  value:
    string | null
): string {
  if (!value) {
    return '—';
  }

  const parsed =
    new Date(
      value
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? value
    : parsed.toLocaleString();
}

export default function AdminMirrorRoomsPanel() {
  const [
    data,
    setData,
  ] =
    useState<AdminMirrorRoomAnalytics | null>(
      null
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
          setData(
            await getAdminMirrorRooms()
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof
            Error
              ? caught.message
              : 'MirrorRoom analytics could not be loaded.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ]
  );

  const rows =
    useMemo(
      () =>
        data?.rooms ??
        [],
      [
        data,
      ]
    );

  return (
    <section
      id="admin-mirrorrooms"
      className="
        mt-6
        rounded-[28px]
        border
        border-white/10
        p-5
        text-white
        shadow-sm
      "
      style={{
        backgroundColor:
          'rgba(0, 0, 0, 0.70)',
        backgroundImage:
          'none',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
            Collaborative operations
          </div>

          <h2 className="mt-1 text-lg font-semibold text-white">
            MirrorRoom Activity
          </h2>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-white/50">
            Operational metadata only. Administrators can see who created and joined a room, but never the room prompt, shared thoughts, summaries, takeaways, journals, or any conversation content.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
            text-xs
            font-semibold
            text-white/75
            disabled:opacity-40
          "
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-black/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <LockKeyhole className="h-4 w-4" />
          Content visibility disabled
        </div>

        <p className="mt-1 text-xs leading-5 text-emerald-100/55">
          This admin endpoint does not query MirrorRoom contributions at all.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/55 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            MirrorRooms created
          </div>

          <div className="mt-2 text-3xl font-bold text-white">
            {loading
              ? '—'
              : data?.counts.total ??
                0}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/15 bg-black/60 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/50">
            Active
          </div>

          <div className="mt-2 text-3xl font-bold text-emerald-200">
            {loading
              ? '—'
              : data?.counts.active ??
                0}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/55 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
            Closed / expired
          </div>

          <div className="mt-2 text-3xl font-bold text-white/70">
            {loading
              ? '—'
              : data?.counts.closed ??
                0}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/55">
        <table className="min-w-[1050px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 bg-black/60 text-[10px] uppercase tracking-[0.08em] text-white/40">
              <th className="px-4 py-3">
                MirrorRoom
              </th>

              <th className="px-4 py-3">
                Created by
              </th>

              <th className="px-4 py-3">
                Joined entities
              </th>

              <th className="px-4 py-3">
                Created
              </th>

              <th className="px-4 py-3">
                Expires
              </th>

              <th className="px-4 py-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (
                room
              ) => (
                <tr
                  key={
                    room.id
                  }
                  className="border-b border-white/[0.07] align-top text-xs text-white/65"
                >
                  <td className="px-4 py-4 font-mono text-white/70">
                    {room.id}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-white/75">
                      {displayIdentity(
                        room.creator
                      )}
                    </div>

                    {room.creator.email && (
                      <div className="mt-1 font-mono text-[10px] text-white/30">
                        {room.creator.uid}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                      <Users className="h-3 w-3" />
                      {room.participantCount}
                    </div>

                    <div className="space-y-1.5">
                      {room.participants.map(
                        (
                          participant,
                          index
                        ) => (
                          <div
                            key={`${room.id}-${participant.uid}-${index}`}
                            className="rounded-lg bg-black/55 px-2.5 py-1.5"
                          >
                            <div className="text-[11px] text-white/70">
                              {participant.email ||
                                participant.uid}
                            </div>

                            <div className="mt-0.5 text-[9px] uppercase tracking-wide text-white/30">
                              {participant.role}
                            </div>
                          </div>
                        )
                      )}

                      {room.participants.length ===
                        0 && (
                        <span className="text-white/30">
                          No participants recorded
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(
                      room.createdAt
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(
                      room.expiresAt
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em] ${statusClasses(
                        room.status
                      )}`}
                    >
                      {room.status}
                    </span>

                    {room.closureReason &&
                      room.status ===
                        'closed' && (
                        <div className="mt-1 text-[9px] text-white/30">
                          {room.closureReason ===
                          'host_closed'
                            ? 'Closed by host'
                            : room.closureReason ===
                                'expired'
                              ? 'Expired'
                              : room.closureReason}
                        </div>
                      )}
                  </td>
                </tr>
              )
            )}

            {!loading &&
              rows.length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-white/35"
                  >
                    No MirrorRooms have been created yet.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

