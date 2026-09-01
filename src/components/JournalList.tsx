import React, {
  useEffect,
  useState,
} from 'react';

import {
  BookOpen,
  Trash2,
  Calendar,
  Tag,
  Search,
  AlertCircle,
  RefreshCw,
  X,
  ShieldAlert,
  Sparkles,
  GitCompare,
  CalendarDays,
  List,
} from 'lucide-react';

import {
  fetchJournalEntries,
  deleteJournalEntry,
  fetchThoughtSnapshots,
  proposeThoughtSnapshot,
  deleteThoughtSnapshot,
  fetchThoughtDiffs,
  generateThoughtDiff,
} from '../lib/api.ts';

import {
  getAiGenerationError,
} from '../lib/aiError.ts';

import {
  ThoughtSnapshotCard,
} from './ThoughtSnapshotCard.tsx';

import {
  ThoughtDiffCard,
} from './ThoughtDiffCard.tsx';

import YearInReflection from './YearInReflection.tsx';

import JournalCalendar from './JournalCalendar.tsx';

import AnchoredDatePicker from './AnchoredDatePicker.tsx';

import type {
  JournalEntry,
  ThoughtSnapshot,
  ThoughtSnapshotProposal,
  ThoughtDiff,
} from '../types.ts';

interface JournalListProps {
  onRefreshTrigger?: number;

  initialSubTab?:
    | 'reflections'
    | 'diffs';

  filterApprovedSnapshots?: boolean;

  highlightDiffId?:
    | string
    | null;

  /*
   * Tells App.tsx that persisted Firestore
   * state changed.
   */
  onDataChanged?: () => void;
}

export const JournalList:
  React.FC<JournalListProps> = ({
    onRefreshTrigger,
    initialSubTab = 'reflections',
    filterApprovedSnapshots = false,
    highlightDiffId = null,
    onDataChanged,
  }) => {
    const [
      entries,
      setEntries,
    ] = useState<JournalEntry[]>([]);

    const [
      snapshots,
      setSnapshots,
    ] =
      useState<ThoughtSnapshot[]>(
        []
      );

    const [
      diffs,
      setDiffs,
    ] =
      useState<ThoughtDiff[]>([]);

    const [
      activeSubTab,
      setActiveSubTab,
    ] =
      useState<
        'reflections' | 'diffs'
      >(initialSubTab);

    const [
      showOnlyApprovedSnapshots,
      setShowOnlyApprovedSnapshots,
    ] =
      useState(
        filterApprovedSnapshots
      );

    const [
      highlightedDiff,
      setHighlightedDiff,
    ] =
      useState<string | null>(
        highlightDiffId
      );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] =
      useState<string | null>(
        null
      );

    const [
      searchTerm,
      setSearchTerm,
    ] = useState('');

    const [
      selectedTag,
      setSelectedTag,
    ] =
      useState<string | null>(
        null
      );

    const [
      startDate,
      setStartDate,
    ] = useState('');

    const [
      endDate,
      setEndDate,
    ] = useState('');

    const [
      historyView,
      setHistoryView,
    ] =
      useState<
        'list' | 'calendar'
      >('list');

    const [
      deletingId,
      setDeletingId,
    ] =
      useState<string | null>(
        null
      );

    const [
      deleteConfirmId,
      setDeleteConfirmId,
    ] =
      useState<string | null>(
        null
      );

    const [
      generatingForEntryId,
      setGeneratingForEntryId,
    ] =
      useState<string | null>(
        null
      );

    const [
      proposalsByEntryId,
      setProposalsByEntryId,
    ] =
      useState<
        Record<
          string,
          ThoughtSnapshotProposal
        >
      >({});

    const [
      proposalErrorsByEntryId,
      setProposalErrorsByEntryId,
    ] =
      useState<
        Record<string, string>
      >({});

    /*
     * Navigation sync
     */
    useEffect(() => {
      setActiveSubTab(
        initialSubTab
      );
    }, [initialSubTab]);

    useEffect(() => {
      setShowOnlyApprovedSnapshots(
        Boolean(
          filterApprovedSnapshots
        )
      );
    }, [
      filterApprovedSnapshots,
    ]);

    /*
     * Highlight a Thought Diff when navigated
     * from Overview.
     */
    useEffect(() => {
      setHighlightedDiff(
        highlightDiffId ||
          null
      );

      if (
        highlightDiffId &&
        activeSubTab === 'diffs'
      ) {
        const timer =
          window.setTimeout(
            () => {
              const element =
                document.getElementById(
                  `thought-diff-${highlightDiffId}`
                );

              if (element) {
                element.scrollIntoView(
                  {
                    behavior:
                      'smooth',

                    block:
                      'center',
                  }
                );
              }
            },
            150
          );

        return () =>
          window.clearTimeout(
            timer
          );
      }

      return undefined;
    }, [
      highlightDiffId,
      activeSubTab,
    ]);

    /*
     * Canonical Journal History loader.
     */
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          journalData,
          snapshotData,
          diffData,
        ] =
          await Promise.all([
            fetchJournalEntries(),
            fetchThoughtSnapshots(),
            fetchThoughtDiffs(),
          ]);

        setEntries(
          journalData
        );

        setSnapshots(
          snapshotData
        );

        setDiffs(
          diffData
        );
      } catch (err: unknown) {
        console.error(
          '[MirrorTrace] Failed to load Journal History:',
          err
        );

        setError(
          (err as Error)
            ?.message ||
            'Unable to load your journal history.'
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      void loadData();
    }, [onRefreshTrigger]);

    /*
     * Delete journal.
     *
     * Backend already handles cascade cleanup of
     * snapshots, Thought Diffs and provenance.
     */
    const handleDelete =
      async (id: string) => {
        try {
          setDeletingId(
            id
          );

          await deleteJournalEntry(
            id
          );

          setDeleteConfirmId(
            null
          );

          /*
           * Re-fetch canonical backend state instead
           * of guessing which dependent docs remain.
           */
          await loadData();

          /*
           * Refresh Overview.
           */
          onDataChanged?.();
        } catch (err: unknown) {
          const message =
            (err as Error)
              ?.message ||
            'Failed to delete journal entry.';

          alert(message);
        } finally {
          setDeletingId(
            null
          );
        }
      };

    /*
     * Delete one approved snapshot.
     *
     * Backend also cleans dependent Thought Diffs
     * and provenance.
     */
    const handleDeleteSnapshotOnly =
      async (
        snapshotId: string
      ) => {
        try {
          await deleteThoughtSnapshot(
            snapshotId
          );

          /*
           * Reload entire History because deleting a
           * snapshot can also invalidate Thought Diffs.
           */
          await loadData();

          /*
           * Refresh Overview counts + Perspective Evolution.
           */
          onDataChanged?.();
        } catch (err: unknown) {
          const message =
            (err as Error)
              ?.message ||
            'Failed to delete snapshot.';

          alert(message);
        }
      };

    /*
     * Generate non-persistent snapshot proposal.
     */
    const handleGenerateProposalForEntry =
      async (
        entryId: string
      ) => {
        try {
          setGeneratingForEntryId(
            entryId
          );

          setProposalErrorsByEntryId(
            (previous) => ({
              ...previous,
              [entryId]: '',
            })
          );

          const response =
            await proposeThoughtSnapshot(
              entryId
            );

          if (
            response.success &&
            response.proposal
          ) {
            setProposalsByEntryId(
              (previous) => ({
                ...previous,

                [entryId]:
                  response.proposal,
              })
            );
          }
        } catch (err: unknown) {
          const message =
            getAiGenerationError(
              err,
              'Could not generate snapshot proposal.'
            );

          setProposalErrorsByEntryId(
            (previous) => ({
              ...previous,

              [entryId]:
                message,
            })
          );
        } finally {
          setGeneratingForEntryId(
            null
          );
        }
      };

    /*
     * Snapshot was already successfully persisted
     * by ThoughtSnapshotCard.
     *
     * Now:
     * 1. update local History immediately;
     * 2. run Thought Diff matching;
     * 3. re-fetch canonical state;
     * 4. tell Overview to refresh.
     */
    const handleAcceptProposal =
      async (
        entryId: string,
        newSnapshot: ThoughtSnapshot
      ) => {
        setSnapshots(
          (previous) => [
            newSnapshot,

            ...previous.filter(
              (snapshot) =>
                snapshot.id !==
                newSnapshot.id
            ),
          ]
        );

        setEntries(
          (previous) =>
            previous.map(
              (entry) =>
                entry.id ===
                entryId
                  ? {
                      ...entry,

                      snapshotId:
                        newSnapshot.id,
                    }
                  : entry
            )
        );

        setProposalsByEntryId(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next[
              entryId
            ];

            return next;
          }
        );

        try {
          const diffResponse =
            await generateThoughtDiff(
              newSnapshot.id
            );

          if (
            diffResponse.diffCreated &&
            diffResponse.diff
          ) {
            setDiffs(
              (previous) => [
                diffResponse.diff!,

                ...previous.filter(
                  (diff) =>
                    diff.id !==
                    diffResponse
                      .diff!.id
                ),
              ]
            );
          }

          /*
           * Even when diffCreated === false,
           * backend may have:
           *
           * - found an existing pair;
           * - cleaned an invalid pair;
           * - returned no related candidate.
           *
           * Therefore reload canonical data.
           */
          await loadData();
        } catch (err: unknown) {
          console.warn(
            '[MirrorTrace] Thought Diff generation after snapshot approval failed:',
            err
          );

          /*
           * Snapshot itself is already valid and persisted.
           * A temporary AI outage must never invalidate the saved snapshot.
           */
          console.info(
            '[MirrorTrace] Thought Diff temporarily unavailable:',
            getAiGenerationError(
              err,
              'Thought Diff generation is temporarily unavailable.'
            )
          );

          await loadData();
        } finally {
          /*
           * Now App.tsx reloads its Overview data.
           */
          onDataChanged?.();
        }
      };

    const handleRejectProposal =
      (
        entryId: string
      ) => {
        setProposalsByEntryId(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next[
              entryId
            ];

            return next;
          }
        );

        setProposalErrorsByEntryId(
          (previous) => ({
            ...previous,

            [entryId]: '',
          })
        );
      };

    /*
     * Snapshot lookup by source journal.
     */
    const snapshotMap =
      new Map<
        string,
        ThoughtSnapshot
      >();

    for (
      const snapshot of
      snapshots
    ) {
      if (
        snapshot.sourceJournalId
      ) {
        snapshotMap.set(
          snapshot.sourceJournalId,
          snapshot
        );
      }

      if (snapshot.id) {
        snapshotMap.set(
          snapshot.id,
          snapshot
        );
      }
    }

    /*
     * Search / topic / date / approved snapshot filters.
     */
    const allTags: string[] =
      Array.from(
        new Set<string>(
          entries.flatMap(
            (entry) =>
              (
                entry.topicTags ||
                []
              ).filter(
                (
                  tag
                ): tag is string =>
                  typeof tag ===
                    'string' &&
                  Boolean(
                    tag.trim()
                  )
              )
          )
        )
      ).sort(
        (
          left,
          right
        ) =>
          left.localeCompare(
            right
          )
      );

    const filteredEntries =
      entries.filter(
        (entry) => {
          const search =
            searchTerm
              .trim()
              .toLowerCase();

          const matchesSearch =
            !search ||
            entry.content
              .toLowerCase()
              .includes(
                search
              ) ||
            (
              entry.topicTags ||
              []
            ).some(
              (tag) =>
                tag
                  .toLowerCase()
                  .includes(
                    search
                  )
            );

          const matchesTag =
            !selectedTag ||
            (
              entry.topicTags ||
              []
            ).includes(
              selectedTag
            );

          const createdAt =
            new Date(
              entry.createdAt
            );

          const hasValidDate =
            !Number.isNaN(
              createdAt.getTime()
            );

          let matchesStartDate =
            true;

          if (
            startDate &&
            hasValidDate
          ) {
            const start =
              new Date(
                `${startDate}T00:00:00`
              );

            matchesStartDate =
              createdAt >=
              start;
          }

          let matchesEndDate =
            true;

          if (
            endDate &&
            hasValidDate
          ) {
            const end =
              new Date(
                `${endDate}T23:59:59.999`
              );

            matchesEndDate =
              createdAt <=
              end;
          }

          const linkedSnapshot =
            snapshotMap.get(
              entry.id
            ) ||
            (
              entry.snapshotId
                ? snapshotMap.get(
                    entry.snapshotId
                  )
                : undefined
            );

          const matchesSnapshotFilter =
            !showOnlyApprovedSnapshots ||
            Boolean(
              linkedSnapshot
            );

          return (
            matchesSearch &&
            matchesTag &&
            matchesStartDate &&
            matchesEndDate &&
            matchesSnapshotFilter
          );
        }
      );

    const hasActiveFilters =
      Boolean(
        searchTerm ||
        selectedTag ||
        startDate ||
        endDate ||
        showOnlyApprovedSnapshots
      );

    const clearAllFilters =
      () => {
        setSearchTerm('');
        setSelectedTag(null);
        setStartDate('');
        setEndDate('');

        if (
          !filterApprovedSnapshots
        ) {
          setShowOnlyApprovedSnapshots(
            false
          );
        }
      };

    const formatDate =
      (isoString: string) => {
        try {
          return new Intl.DateTimeFormat(
            'en-US',
            {
              month:
                'short',

              day:
                'numeric',

              year:
                'numeric',

              hour:
                'numeric',

              minute:
                'numeric',
            }
          ).format(
            new Date(
              isoString
            )
          );
        } catch {
          return isoString;
        }
      };

    return (
      <div className="space-y-6">
        {/* Sub tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-subtab-reflections"
              type="button"
              onClick={() =>
                setActiveSubTab(
                  'reflections'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubTab ===
                'reflections'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />

              <span>
                Saved Reflections ({entries.length})
              </span>
            </button>

            <button
              id="btn-subtab-diffs"
              type="button"
              onClick={() =>
                setActiveSubTab(
                  'diffs'
                )
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSubTab ===
                'diffs'
                  ? 'bg-amber-900 text-amber-50 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />

              <span>
                Thought Diffs ({diffs.length})
              </span>
            </button>
          </div>

          {activeSubTab ===
            'diffs' &&
            snapshots.length >=
              2 && (
              <button
                id="btn-evaluate-diffs-manual"
                type="button"
                onClick={async () => {
                  if (
                    snapshots.length ===
                    0
                  ) {
                    return;
                  }

                  try {
                    /*
                     * API returns approved snapshots newest first.
                     */
                    const latestSnapshot =
                      snapshots[0];

                    await generateThoughtDiff(
                      latestSnapshot.id
                    );

                    await loadData();

                    onDataChanged?.();
                  } catch (err) {
                    console.warn(
                      '[MirrorTrace] Manual diff evaluation failed:',
                      err
                    );
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Scan approved snapshots and evaluate perspective shifts"
              >
                <RefreshCw className="w-3 h-3" />

                <span>
                  Evaluate Candidates
                </span>
              </button>
            )}
        </div>

        {/* THOUGHT DIFF VIEW */}
        {activeSubTab ===
          'diffs' && (
          <div className="space-y-4">
            {diffs.length ===
            0 ? (
              <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-800">
                  <GitCompare className="w-6 h-6" />
                </div>

                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="font-serif text-base font-semibold text-stone-900">
                    No Thought Diffs Generated Yet
                  </h3>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    When you approve reflections with
                    overlapping topics, MirrorTrace will
                    evaluate and surface perspective shifts
                    between earlier and later stances.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {diffs.map(
                  (diff) => (
                    <div
                      id={`thought-diff-${diff.id}`}
                      key={
                        diff.id
                      }
                      className={
                        highlightedDiff ===
                        diff.id
                          ? 'ring-2 ring-amber-800 ring-offset-2 rounded-xl transition-all shadow-md'
                          : 'transition-all'
                      }
                    >
                      <ThoughtDiffCard
                        diff={
                          diff
                        }
                        onStatusChange={(
                          newStatus
                        ) => {
                          setDiffs(
                            (
                              previous
                            ) =>
                              previous.map(
                                (
                                  currentDiff
                                ) =>
                                  currentDiff.id ===
                                  diff.id
                                    ? {
                                        ...currentDiff,
                                        relationshipStatus:
                                          newStatus,
                                      }
                                    : currentDiff
                              )
                          );
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* REFLECTION VIEW */}
        {activeSubTab ===
          'reflections' && (
          <>
            {/* Search + Filter */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />

                  <input
                    id="search-journal-input"
                    type="text"
                    value={
                      searchTerm
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchTerm(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Search your reflections and thoughts..."
                    className="w-full pl-9 pr-9 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm(
                          ''
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadData()
                  }
                  disabled={
                    loading
                  }
                  className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                  title="Refresh Journal List"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      loading
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </button>
              </div>

              {/* Date range */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                <AnchoredDatePicker
                  label="From date"
                  value={
                    startDate
                  }
                  max={
                    endDate ||
                    undefined
                  }
                  onChange={
                    setStartDate
                  }
                />

                <AnchoredDatePicker
                  label="To date"
                  value={
                    endDate
                  }
                  min={
                    startDate ||
                    undefined
                  }
                  onChange={
                    setEndDate
                  }
                />

                <button
                  type="button"
                  onClick={
                    clearAllFilters
                  }
                  disabled={
                    !hasActiveFilters
                  }
                  className="rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {showOnlyApprovedSnapshots && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-950 border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-800" />

                    Approved Snapshots Filter

                    <button
                      type="button"
                      onClick={() =>
                        setShowOnlyApprovedSnapshots(
                          false
                        )
                      }
                      className="ml-1 text-amber-800 hover:text-amber-950"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {allTags.length >
                  0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 mr-1">
                      <Tag className="w-3 h-3" />
                      Tags:
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTag(
                          null
                        )
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        selectedTag ===
                        null
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      All ({entries.length})
                    </button>

                    {allTags.map(
                      (tag) => (
                        <button
                          key={
                            tag
                          }
                          type="button"
                          onClick={() =>
                            setSelectedTag(
                              selectedTag ===
                                tag
                                ? null
                                : tag
                            )
                          }
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            selectedTag ===
                            tag
                              ? 'bg-amber-900 text-amber-50'
                              : 'bg-amber-50 text-amber-900 border border-amber-200/60 hover:bg-amber-100'
                          }`}
                        >
                          #{tag}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-3 text-[11px] text-stone-500">
                <span>
                  Showing{' '}
                  <strong className="text-stone-800">
                    {filteredEntries.length}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-stone-800">
                    {entries.length}
                  </strong>{' '}
                  reflections
                </span>

                <span>
                  Search and filters use your already-loaded journal data.
                </span>
              </div>
            </div>

            {/* YEAR IN REFLECTION */}
            {!loading && entries.length > 0 && (
              <YearInReflection
                entries={entries}
                snapshots={snapshots}
                diffs={diffs}
              />
            )}

            {/* HISTORY VIEW TOGGLE */}
            {!loading && entries.length > 0 && (
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/35
                  p-3
                "
              >
                <div>
                  <div className="text-xs font-semibold text-white">
                    Browse your reflection history
                  </div>

                  <p className="mt-1 text-[11px] text-stone-400">
                    Switch between the normal list and a month calendar.
                  </p>
                </div>

                <div
                  className="
                    inline-flex
                    rounded-xl
                    border
                    border-white/10
                    bg-black/30
                    p-1
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryView(
                        'list'
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      historyView ===
                      'list'
                        ? 'bg-white/10 text-white'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHistoryView(
                        'calendar'
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      historyView ===
                      'calendar'
                        ? 'bg-white/10 text-white'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Calendar
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />

                  <span>
                    {error}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadData()
                  }
                  className="font-semibold text-red-700 hover:underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading */}
            {loading &&
              entries.length ===
                0 && (
                <div className="space-y-4">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={
                          item
                        }
                        className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs animate-pulse space-y-3"
                      >
                        <div className="h-4 bg-stone-200 rounded w-1/4" />
                        <div className="h-3 bg-stone-100 rounded w-full" />
                        <div className="h-3 bg-stone-100 rounded w-5/6" />
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Empty */}
            {!loading &&
              filteredEntries.length ===
                0 && (
                <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-800">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-serif text-base font-semibold text-stone-900">
                      {hasActiveFilters
                        ? 'No matching reflections'
                        : 'No reflections saved yet'}
                    </h3>

                    <p className="text-xs text-stone-500 leading-relaxed">
                      {hasActiveFilters
                        ? 'Try adjusting your search, topic, date range, or approved-memory filter.'
                        : 'Write your first reflection in Reflect & Chat to begin building your evidence-grounded trace.'}
                    </p>
                  </div>
                </div>
              )}

            {/* Entries / Calendar */}
            {historyView ===
            'calendar' ? (
              <JournalCalendar
                entries={
                  filteredEntries
                }
              />
            ) : (
              <div className="space-y-4">
                {filteredEntries.map(
                  (entry) => {
                    const linkedSnapshot =
                      snapshotMap.get(
                        entry.id
                      ) ||
                      (
                        entry.snapshotId
                          ? snapshotMap.get(
                              entry.snapshotId
                            )
                          : undefined
                      );
  
                    const activeProposal =
                      proposalsByEntryId[
                        entry.id
                      ];
  
                    const isGenerating =
                      generatingForEntryId ===
                      entry.id;
  
                    const proposalError =
                      proposalErrorsByEntryId[
                        entry.id
                      ];
  
                    return (
                      <div
                        key={
                          entry.id
                        }
                        className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
  
                            <span>
                              {formatDate(
                                entry.createdAt
                              )}
                            </span>
                          </div>
  
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-stone-400 font-mono">
                              {
                                entry.content
                                  .split(
                                    /\s+/
                                  )
                                  .filter(
                                    Boolean
                                  )
                                  .length
                              }{' '}
                              words
                            </span>
  
                            <button
                              id={`btn-delete-${entry.id}`}
                              type="button"
                              onClick={() =>
                                setDeleteConfirmId(
                                  entry.id
                                )
                              }
                              disabled={
                                deletingId ===
                                entry.id
                              }
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
  
                        <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </div>
  
                        {entry.topicTags &&
                          entry.topicTags
                            .length >
                            0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {entry.topicTags.map(
                                (
                                  tag
                                ) => (
                                  <span
                                    key={
                                      tag
                                    }
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60"
                                  >
                                    #{tag}
                                  </span>
                                )
                              )}
                            </div>
                          )}
  
                        {/* Existing Snapshot */}
                        {linkedSnapshot ? (
                          <div className="mt-3 p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-lg space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 text-amber-950 font-semibold font-serif">
                                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
  
                                <span>
                                  Approved Thought Snapshot
                                </span>
  
                                {linkedSnapshot.userEdited && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-sans font-normal">
                                    User Edited
                                  </span>
                                )}
                              </div>
  
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeleteSnapshotOnly(
                                    linkedSnapshot.id
                                  )
                                }
                                className="text-[11px] text-stone-400 hover:text-red-600 transition-colors shrink-0"
                              >
                                Remove Snapshot
                              </button>
                            </div>
  
                            <blockquote className="text-xs font-serif italic text-amber-950 leading-relaxed">
                              "{linkedSnapshot.positionStatement}"
                            </blockquote>
  
                            <div className="flex items-start gap-3 flex-wrap text-[11px] text-stone-600 pt-1">
                              <span>
                                <strong>
                                  Topic:
                                </strong>{' '}
                                {linkedSnapshot.topic}
                              </span>
  
                              {linkedSnapshot.tags &&
                                linkedSnapshot
                                  .tags
                                  .length >
                                  0 && (
                                  <span className="text-stone-500">
                                    {linkedSnapshot.tags
                                      .map(
                                        (
                                          tag
                                        ) =>
                                          `#${tag}`
                                      )
                                      .join(
                                        ' '
                                      )}
                                  </span>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2">
                            {!activeProposal &&
                              !isGenerating && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleGenerateProposalForEntry(
                                      entry.id
                                    )
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80 transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
  
                                  Generate Thought Snapshot
                                </button>
                              )}
  
                            {isGenerating && (
                              <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-lg flex items-center gap-2 text-xs text-amber-900">
                                <div className="w-3.5 h-3.5 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
  
                                Analyzing reflection...
                              </div>
                            )}
  
                            {proposalError && (
                              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3 text-xs text-red-800">
                                <span>
                                  {proposalError}
                                </span>
  
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleGenerateProposalForEntry(
                                      entry.id
                                    )
                                  }
                                  className="font-semibold text-red-700 underline"
                                >
                                  Retry
                                </button>
                              </div>
                            )}
  
                            {activeProposal && (
                              <div className="mt-3">
                                <ThoughtSnapshotCard
                                  proposal={
                                    activeProposal
                                  }
                                  onAccepted={(
                                    snapshot
                                  ) =>
                                    void handleAcceptProposal(
                                      entry.id,
                                      snapshot
                                    )
                                  }
                                  onRejected={() =>
                                    handleRejectProposal(
                                      entry.id
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
  
                        {/* Delete Confirmation */}
                        {deleteConfirmId ===
                          entry.id && (
                          <div className="mt-4 p-4 bg-red-50/80 border border-red-200 rounded-lg space-y-3">
                            <div className="flex items-start gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
  
                              <div>
                                <p className="text-xs font-semibold text-red-900">
                                  Permanently delete this reflection?
                                </p>
  
                                <p className="mt-1 text-[11px] text-red-700 leading-relaxed">
                                  The journal entry, linked snapshots,
                                  dependent Thought Diffs and provenance
                                  will be safely removed or invalidated.
                                </p>
                              </div>
                            </div>
  
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmId(
                                    null
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  entry.id
                                }
                                className="px-3 py-1.5 rounded-md text-xs font-medium text-stone-600 hover:bg-stone-200/60"
                              >
                                Cancel
                              </button>
  
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(
                                    entry.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  entry.id
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold"
                              >
                                {deletingId ===
                                entry.id ? (
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
  
                                {deletingId ===
                                entry.id
                                  ? 'Deleting...'
                                  : 'Confirm Delete'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };
