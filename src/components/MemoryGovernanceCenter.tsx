import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Archive,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileJson,
  Fingerprint,
  History,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';

import type {
  PerspectiveWatch,
  ThoughtSnapshot,
} from '../types.ts';

import {
  deleteThoughtSnapshot,
  downloadMirrorTraceMemory,
  fetchPerspectiveWatches,
  fetchThoughtSnapshots,
  updatePerspectiveWatchStatus,
} from '../lib/api.ts';

import {
  NotificationSettings,
} from './NotificationSettings.tsx';

interface MemoryGovernanceCenterProps {
  onMemoryChanged?: () => void;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return 'Not set';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
}

function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return 'Not set';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  );
}

function getRetentionLabel(
  value?: string | null
): string {
  switch (value) {
    case '30_days':
      return '30 days';

    case '180_days':
      return '180 days';

    case '365_days':
      return '1 year';

    case 'until_removed':
      return 'Until you remove it';

    default:
      return 'Until you remove it';
  }
}

function getWatchStatusLabel(
  value:
    PerspectiveWatch['status']
): string {
  switch (value) {
    case 'scheduled':
      return 'Scheduled';

    case 'due':
      return 'Due now';

    case 'completed':
      return 'Completed';

    case 'dismissed':
      return 'Dismissed';

    default:
      return String(value);
  }
}

export const MemoryGovernanceCenter:
  React.FC<MemoryGovernanceCenterProps> = ({
    onMemoryChanged,
  }) => {
    const [
      snapshots,
      setSnapshots,
    ] =
      useState<ThoughtSnapshot[]>([]);

    const [
      watches,
      setWatches,
    ] =
      useState<PerspectiveWatch[]>([]);

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState<string | null>(null);

    const [
      deletingSnapshotId,
      setDeletingSnapshotId,
    ] =
      useState<string | null>(null);

    const [
      updatingWatchId,
      setUpdatingWatchId,
    ] =
      useState<string | null>(null);

    const [
      exporting,
      setExporting,
    ] =
      useState(false);

    const [
      feedbackMessage,
      setFeedbackMessage,
    ] =
      useState<string | null>(null);

    const loadData =
      useCallback(
        async () => {
          try {
            setLoading(true);
            setError(null);

            const [
              snapshotData,
              watchData,
            ] =
              await Promise.all([
                fetchThoughtSnapshots(),
                fetchPerspectiveWatches(),
              ]);

            setSnapshots(
              snapshotData
            );

            setWatches(
              watchData
            );
          } catch (
            err: unknown
          ) {
            console.error(
              '[MirrorTrace] Memory governance load failed:',
              err
            );

            setError(
              (err as Error)
                ?.message ||
                'Could not load your governed AI memory.'
            );
          } finally {
            setLoading(false);
          }
        },
        []
      );

    useEffect(() => {
      void loadData();
    }, [loadData]);

    const activeWatches =
      useMemo(
        () =>
          watches.filter(
            (watch) =>
              watch.status ===
                'scheduled' ||
              watch.status ===
                'due'
          ),
        [watches]
      );

    const dueWatches =
      useMemo(
        () =>
          watches.filter(
            (watch) =>
              watch.status ===
              'due'
          ),
        [watches]
      );

    const expiringSnapshots =
      useMemo(
        () =>
          snapshots.filter(
            (snapshot) =>
              Boolean(
                snapshot.memoryExpiresAt
              )
          ),
        [snapshots]
      );

    const handleDeleteSnapshot =
      async (
        snapshotId: string
      ) => {
        const confirmed =
          window.confirm(
            'Revoke this approved AI memory? MirrorTrace may also remove dependent Thought Diffs and provenance that rely on it.'
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingSnapshotId(
            snapshotId
          );

          setFeedbackMessage(
            null
          );

          await deleteThoughtSnapshot(
            snapshotId
          );

          setSnapshots(
            (current) =>
              current.filter(
                (snapshot) =>
                  snapshot.id !==
                  snapshotId
              )
          );

          setFeedbackMessage(
            'AI memory revoked successfully.'
          );

          onMemoryChanged?.();
        } catch (
          err: unknown
        ) {
          setFeedbackMessage(
            (err as Error)
              ?.message ||
              'Could not revoke this memory.'
          );
        } finally {
          setDeletingSnapshotId(
            null
          );
        }
      };

    const handleWatchStatus =
      async (
        watchId: string,
        status:
          | 'completed'
          | 'dismissed'
      ) => {
        try {
          setUpdatingWatchId(
            watchId
          );

          setFeedbackMessage(
            null
          );

          const result =
            await updatePerspectiveWatchStatus(
              watchId,
              status
            );

          setWatches(
            (current) =>
              current.map(
                (watch) =>
                  watch.id ===
                  watchId
                    ? result.watch
                    : watch
              )
          );

          setFeedbackMessage(
            status ===
              'completed'
              ? 'Perspective revisit completed.'
              : 'Perspective Watch stopped.'
          );

          onMemoryChanged?.();
        } catch (
          err: unknown
        ) {
          setFeedbackMessage(
            (err as Error)
              ?.message ||
              'Could not update the Perspective Watch.'
          );
        } finally {
          setUpdatingWatchId(
            null
          );
        }
      };

    const handleExport =
      async () => {
        try {
          setExporting(true);

          setFeedbackMessage(
            null
          );

          await downloadMirrorTraceMemory();

          setFeedbackMessage(
            'Your governed MirrorTrace memory was exported.'
          );
        } catch (
          err: unknown
        ) {
          setFeedbackMessage(
            (err as Error)
              ?.message ||
              'Could not export your MirrorTrace memory.'
          );
        } finally {
          setExporting(false);
        }
      };

    if (loading) {
      return (
        <div className="animate-fade-in rounded-2xl border border-stone-200 bg-white p-8">
          <div className="flex min-h-[260px] items-center justify-center">

            <div className="text-center">

              <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-800" />

              <p className="mt-3 text-sm font-medium text-stone-600">
                Loading your AI memory controls...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in space-y-6">

        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 bg-stone-950 px-5 py-6 text-white sm:px-7">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-3xl">

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-stone-950">
                    <Fingerprint className="h-5 w-5" />
                  </div>

                  <div>

                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                      User-Governed AI Memory
                    </p>

                    <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                      Memory Governance Center
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300">
                  Inspect exactly what MirrorTrace is allowed to remember,
                  manage retention, control future perspective revisits,
                  configure reminder delivery, export your data, or revoke
                  AI memory completely.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    void loadData()
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
                >
                  <RefreshCw className="h-4 w-4" />

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleExport()
                  }
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-4 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-100 disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  Export My Memory
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4">

            <div className="bg-white p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Approved memories
              </p>

              <p className="mt-2 font-serif text-2xl font-bold text-stone-950">
                {snapshots.length}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Expiring memories
              </p>

              <p className="mt-2 font-serif text-2xl font-bold text-stone-950">
                {expiringSnapshots.length}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Active watches
              </p>

              <p className="mt-2 font-serif text-2xl font-bold text-stone-950">
                {activeWatches.length}
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Due now
              </p>

              <p className="mt-2 font-serif text-2xl font-bold text-amber-900">
                {dueWatches.length}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

              <div>

                <p className="text-xs font-bold text-red-900">
                  Memory governance could not load
                </p>

                <p className="mt-1 text-xs leading-relaxed text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {feedbackMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-950">
              {feedbackMessage}
            </p>
          </div>
        )}

        {/* Notification delivery */}
        <NotificationSettings />

        {/* Governance principles */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">

          <div className="rounded-2xl border border-stone-200 bg-white p-5">

            <ShieldCheck className="h-5 w-5 text-emerald-700" />

            <h2 className="mt-3 text-sm font-bold text-stone-950">
              Consent-bound memory
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Only Thought Snapshots you explicitly approve are treated as
              persistent AI memory.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">

            <Eye className="h-5 w-5 text-amber-800" />

            <h2 className="mt-3 text-sm font-bold text-stone-950">
              Inspectable provenance
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              MirrorTrace keeps comparisons traceable to approved snapshots
              and their source reflections.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">

            <KeyRound className="h-5 w-5 text-stone-700" />

            <h2 className="mt-3 text-sm font-bold text-stone-950">
              Owner-controlled deletion
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Memory can be revoked by its authenticated owner instead of
              remaining permanently hidden inside an AI system.
            </p>
          </div>
        </section>

        {/* Approved AI Memory */}
        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Database className="h-5 w-5 text-amber-800" />

                <h2 className="font-serif text-lg font-bold text-stone-950">
                  Approved AI Memory
                </h2>
              </div>

              <p className="mt-1 text-xs text-stone-500">
                The exact structured perspectives MirrorTrace is permitted
                to reuse.
              </p>
            </div>

            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-600">
              {snapshots.length} approved
            </span>
          </div>

          {snapshots.length === 0 ? (
            <div className="px-5 py-10 text-center">

              <Archive className="mx-auto h-7 w-7 text-stone-300" />

              <p className="mt-3 text-sm font-semibold text-stone-700">
                No approved AI memory yet.
              </p>

              <p className="mt-1 text-xs text-stone-500">
                A reflection becomes memory only after you approve its
                Suggested Thought Snapshot.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">

              {snapshots.map(
                (snapshot) => (
                  <article
                    key={snapshot.id}
                    className="p-5 sm:p-6"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">

                            <CheckCircle2 className="h-3 w-3" />

                            Approved memory
                          </span>

                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900">
                            {snapshot.topic ||
                              'Reflection'}
                          </span>
                        </div>

                        <blockquote className="mt-3 max-w-4xl font-serif text-base italic leading-relaxed text-stone-900">
                          “{snapshot.positionStatement}”
                        </blockquote>

                        {Array.isArray(
                          snapshot.tags
                        ) &&
                          snapshot.tags.length >
                            0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">

                              {snapshot.tags.map(
                                (
                                  tag
                                ) => (
                                  <span
                                    key={tag}
                                    className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-600"
                                  >
                                    #{tag}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                              Approved
                            </p>

                            <p className="mt-1 text-xs font-semibold text-stone-700">
                              {formatDate(
                                snapshot.approvedAt ||
                                  snapshot.createdAt
                              )}
                            </p>
                          </div>

                          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                              Retention
                            </p>

                            <p className="mt-1 text-xs font-semibold text-stone-700">
                              {getRetentionLabel(
                                snapshot.memoryRetention
                              )}
                            </p>
                          </div>

                          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                              Expires
                            </p>

                            <p className="mt-1 text-xs font-semibold text-stone-700">
                              {snapshot.memoryExpiresAt
                                ? formatDate(
                                    snapshot.memoryExpiresAt
                                  )
                                : 'Only when you revoke it'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteSnapshot(
                            snapshot.id
                          )
                        }
                        disabled={
                          deletingSnapshotId ===
                          snapshot.id
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingSnapshotId ===
                        snapshot.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        Revoke memory
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* Perspective Watch */}
        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-2">

              <BellRing className="h-5 w-5 text-amber-800" />

              <h2 className="font-serif text-lg font-bold text-stone-950">
                Perspective Watch
              </h2>
            </div>

            <p className="mt-1 text-xs text-stone-500">
              Perspectives you intentionally asked MirrorTrace to bring
              back later.
            </p>
          </div>

          {watches.length === 0 ? (
            <div className="px-5 py-10 text-center">

              <CalendarClock className="mx-auto h-7 w-7 text-stone-300" />

              <p className="mt-3 text-sm font-semibold text-stone-700">
                No Perspective Watches yet.
              </p>

              <p className="mt-1 text-xs text-stone-500">
                Schedule one from any Thought Diff.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">

              {watches.map(
                (watch) => {
                  const active =
                    watch.status ===
                      'scheduled' ||
                    watch.status ===
                      'due';

                  return (
                    <article
                      key={watch.id}
                      className="p-5 sm:p-6"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className={
                                watch.status ===
                                'due'
                                  ? 'rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-950'
                                  : watch.status ===
                                      'scheduled'
                                    ? 'rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800'
                                    : 'rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600'
                              }
                            >
                              {getWatchStatusLabel(
                                watch.status
                              )}
                            </span>

                            {watch.emailEnabled && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-stone-600">

                                <Mail className="h-3 w-3" />

                                Email reminder
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 font-serif text-base font-bold text-stone-950">
                            {watch.topic ||
                              'Perspective revisit'}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">

                            <span className="inline-flex items-center gap-1.5">

                              <Clock3 className="h-3.5 w-3.5" />

                              Revisit{' '}
                              {formatDateTime(
                                watch.revisitAt
                              )}
                            </span>

                            {watch.emailSentAt && (
                              <span className="inline-flex items-center gap-1.5">

                                <Mail className="h-3.5 w-3.5" />

                                Email sent{' '}
                                {formatDate(
                                  watch.emailSentAt
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {active && (
                          <div className="flex flex-wrap gap-2">

                            {watch.status ===
                              'due' && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleWatchStatus(
                                    watch.id,
                                    'completed'
                                  )
                                }
                                disabled={
                                  updatingWatchId ===
                                  watch.id
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
                              >

                                <CheckCircle2 className="h-4 w-4" />

                                Mark revisited
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                void handleWatchStatus(
                                  watch.id,
                                  'dismissed'
                                )
                              }
                              disabled={
                                updatingWatchId ===
                                watch.id
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60"
                            >
                              {updatingWatchId ===
                              watch.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}

                              Stop watching
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Export / audit */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">

            <div className="flex items-center gap-2">

              <FileJson className="h-5 w-5 text-amber-800" />

              <h2 className="text-sm font-bold text-stone-950">
                Portable memory
              </h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Export produces a JSON record containing your journals,
              approved Thought Snapshots, Thought Diffs, provenance and
              Perspective Watches.
            </p>

            <button
              type="button"
              onClick={() =>
                void handleExport()
              }
              disabled={exporting}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-60"
            >

              <Download className="h-4 w-4" />

              Download JSON
            </button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">

            <div className="flex items-center gap-2">

              <History className="h-5 w-5 text-amber-800" />

              <h2 className="text-sm font-bold text-stone-950">
                Memory is not silent
              </h2>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              MirrorTrace separates raw reflections, AI suggestions,
              approved memory and generated comparisons. AI suggestions do
              not automatically become persistent memory.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

          <div className="flex items-start gap-3">

            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

            <div>

              <p className="text-xs font-bold text-emerald-900">
                Memory governance is owner-scoped
              </p>

              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                These controls operate through authenticated API routes
                bound to the signed-in Firebase UID.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };