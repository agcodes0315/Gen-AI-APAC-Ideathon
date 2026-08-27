import React, {
  useState,
} from 'react';

import {
  GitCompare,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
  PenLine,
  EyeOff,
  History,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  X,
  Info,
  PlayCircle,
} from 'lucide-react';

import type {
  JournalEntry,
  ThoughtSnapshot,
  ThoughtDiff,
  ThoughtDiffProvenance,
} from '../types.ts';

import {
  fetchDiffProvenance,
} from '../lib/api.ts';

import {
  GuidedDemoModal,
} from './GuidedDemoModal.tsx';

export interface DashboardNavigationOptions {
  privateSession?: boolean;

  subTab?:
    | 'reflections'
    | 'diffs';

  filterApprovedSnapshots?: boolean;

  highlightDiffId?: string;
}

interface DashboardOverviewProps {
  entries: JournalEntry[];

  snapshots: ThoughtSnapshot[];

  diffs: ThoughtDiff[];

  loading: boolean;

  onNavigate: (
    tab:
      | 'overview'
      | 'journal'
      | 'history',
    options?: DashboardNavigationOptions
  ) => void;
}

export const DashboardOverview:
  React.FC<DashboardOverviewProps> = ({
    entries,
    snapshots,
    diffs,
    loading,
    onNavigate,
  }) => {
    const [
      showHowItWorks,
      setShowHowItWorks,
    ] =
      useState(false);

    const [
      showGuidedDemo,
      setShowGuidedDemo,
    ] =
      useState(false);

    const [
      selectedDiffForProvenance,
      setSelectedDiffForProvenance,
    ] =
      useState<ThoughtDiff | null>(
        null
      );

    const [
      provenanceData,
      setProvenanceData,
    ] =
      useState<ThoughtDiffProvenance | null>(
        null
      );

    const [
      loadingProvenance,
      setLoadingProvenance,
    ] =
      useState(false);

    const [
      provenanceError,
      setProvenanceError,
    ] =
      useState<string | null>(
        null
      );

    const reflectionsCount =
      entries.length;

    const approvedSnapshotsCount =
      snapshots.length;

    const thoughtDiffsCount =
      diffs.length;

    const latestDiff =
      diffs.length > 0
        ? diffs[0]
        : null;

    const handleOpenEvidence =
      async (
        diff: ThoughtDiff
      ) => {
        setSelectedDiffForProvenance(
          diff
        );

        setProvenanceData(
          null
        );

        setProvenanceError(
          null
        );

        setLoadingProvenance(
          true
        );

        try {
          const provenance =
            await fetchDiffProvenance(
              diff.id
            );

          setProvenanceData(
            provenance
          );
        } catch (
          err: unknown
        ) {
          setProvenanceError(
            (err as Error)
              ?.message ||
              'Unable to load provenance evidence.'
          );
        } finally {
          setLoadingProvenance(
            false
          );
        }
      };

    const handleStartFromDemo =
      () => {
        setShowGuidedDemo(
          false
        );

        onNavigate(
          'journal'
        );
      };

    return (
      <>
        <div className="space-y-8 animate-fade-in">

          {/* ==================================================
              HEADER
             ================================================== */}

          <div className="space-y-4 border-b border-stone-200/80 pb-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div className="space-y-3">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                    MirrorTrace
                  </h1>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-amber-100
                      text-amber-900
                      border
                      border-amber-300/80
                      shadow-xs
                    "
                  >
                    <GitCompare className="w-3.5 h-3.5 text-amber-800" />

                    Version control for
                    your thinking.
                  </span>
                </div>

                <p className="text-sm sm:text-base text-stone-600 font-sans max-w-3xl leading-relaxed">
                  Track how your ideas
                  evolve with consent,
                  evidence, and complete
                  control over AI memory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowGuidedDemo(
                      true
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-stone-300
                    bg-white
                    text-stone-800
                    text-xs
                    sm:text-sm
                    font-semibold
                    hover:border-amber-400
                    hover:bg-amber-50
                    transition-colors
                  "
                >
                  <PlayCircle className="w-4 h-4 text-amber-800" />

                  See Example Journey
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      'journal'
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-amber-800
                    hover:bg-amber-900
                    text-amber-50
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-colors
                  "
                >
                  <PenLine className="w-4 h-4" />

                  Write a Reflection
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              STAT CARDS
             ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

            <button
              id="stat-reflections"
              type="button"
              onClick={() =>
                onNavigate(
                  'history',
                  {
                    subTab:
                      'reflections',
                  }
                )
              }
              className="mirrortrace-stat-card text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">

                <span className="text-xs font-medium uppercase tracking-wider text-stone-700">
                  Reflections
                </span>

                <div
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-stone-100
                    text-stone-600
                    group-hover:bg-amber-100
                    group-hover:text-amber-900
                    flex
                    items-center
                    justify-center
                    transition-colors
                  "
                >
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">

                <span className="text-3xl font-serif font-bold text-stone-900">
                  {loading
                    ? '—'
                    : reflectionsCount}
                </span>

                <span className="text-xs text-stone-600 font-medium">
                  saved
                </span>
              </div>

              <p className="mt-1 text-xs text-stone-600">
                Your private journal
              </p>
            </button>

            <button
              id="stat-snapshots"
              type="button"
              onClick={() =>
                onNavigate(
                  'history',
                  {
                    subTab:
                      'reflections',

                    filterApprovedSnapshots:
                      true,
                  }
                )
              }
              className="mirrortrace-stat-card mirrortrace-stat-card-warm text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">

                <span className="text-xs font-medium uppercase tracking-wider text-stone-700">
                  Approved Snapshots
                </span>

                <div
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-amber-50
                    text-amber-800
                    group-hover:bg-amber-100
                    group-hover:text-amber-900
                    flex
                    items-center
                    justify-center
                    transition-colors
                  "
                >
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">

                <span className="text-3xl font-serif font-bold text-stone-900">
                  {loading
                    ? '—'
                    : approvedSnapshotsCount}
                </span>

                <span className="text-xs text-stone-600 font-medium">
                  structured
                </span>
              </div>

              <p className="mt-1 text-xs text-stone-600">
                Only interpretations
                you approved
              </p>
            </button>

            <button
              id="stat-diffs"
              type="button"
              onClick={() =>
                onNavigate(
                  'history',
                  {
                    subTab:
                      'diffs',
                  }
                )
              }
              className="mirrortrace-stat-card text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">

                <span className="text-xs font-medium uppercase tracking-wider text-stone-700">
                  Thought Diffs
                </span>

                <div
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-amber-900/10
                    text-amber-900
                    group-hover:bg-amber-900
                    group-hover:text-amber-50
                    flex
                    items-center
                    justify-center
                    transition-colors
                  "
                >
                  <GitCompare className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">

                <span className="text-3xl font-serif font-bold text-stone-900">
                  {loading
                    ? '—'
                    : thoughtDiffsCount}
                </span>

                <span className="text-xs text-stone-600 font-medium">
                  comparisons
                </span>
              </div>

              <p className="mt-1 text-xs text-stone-600">
                Evidence-backed
                perspective changes
              </p>
            </button>
          </div>

          {/* ==================================================
              PERSPECTIVE EVOLUTION
             ================================================== */}

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">

                <GitCompare className="w-5 h-5 text-amber-800" />

                <span>
                  Perspective Evolution
                </span>
              </h2>

              {thoughtDiffsCount >
                1 && (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      'history',
                      {
                        subTab:
                          'diffs',
                      }
                    )
                  }
                  className="
                    text-xs
                    font-semibold
                    text-amber-900
                    hover:text-amber-950
                    flex
                    items-center
                    gap-1
                    hover:underline
                    cursor-pointer
                  "
                >
                  <span>
                    View all{' '}
                    {
                      thoughtDiffsCount
                    }{' '}
                    Thought Diffs
                  </span>

                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {latestDiff ? (
              <div
                id="recent-perspective-shift-card"
                onClick={() =>
                  onNavigate(
                    'history',
                    {
                      subTab:
                        'diffs',

                      highlightDiffId:
                        latestDiff.id,
                    }
                  )
                }
                className="mt-overview-diff-card cursor-pointer group"
              >

                {/* Diff Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">

                  <div className="space-y-1">

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-0.5
                        rounded-full
                        text-xs
                        font-semibold
                        bg-amber-100
                        text-amber-950
                        border
                        border-amber-300
                      "
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-800" />

                      Your thinking is
                      evolving
                    </span>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 transition-colors">
                      Topic:{' '}
                      {
                        latestDiff.topic
                      }
                    </h3>
                  </div>

                  <div className="text-[11px] font-mono text-stone-600 flex items-center gap-1">

                    <Calendar className="w-3.5 h-3.5 text-stone-400" />

                    <span>
                      Diff generated{' '}
                      {new Date(
                        latestDiff.createdAt
                      ).toLocaleDateString(
                        undefined,
                        {
                          month:
                            'short',

                          day:
                            'numeric',

                          year:
                            'numeric',
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Earlier / Current */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">

                  <div className="mt-overview-earlier md:col-span-5 rounded-xl p-4 space-y-2">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold">
                        Earlier Stance
                      </span>

                      <span
                        className="
                          px-2
                          py-0.5
                          rounded
                          text-[10px]
                          bg-stone-100
                          text-stone-700
                          font-medium
                        "
                      >
                        Initial Reflection
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-relaxed">
                      “
                      {
                        latestDiff.earlierPosition
                      }
                      ”
                    </p>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-center py-1 md:py-0">

                    <div
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-amber-100
                        text-amber-900
                        border
                        border-amber-300
                        flex
                        items-center
                        justify-center
                        shadow-sm
                      "
                    >
                      <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  <div className="mt-overview-current md:col-span-5 rounded-xl p-4 space-y-2">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-950 font-bold">
                        Current Stance
                      </span>

                      <span
                        className="
                          px-2
                          py-0.5
                          rounded
                          text-[10px]
                          bg-amber-200/70
                          text-amber-950
                          font-semibold
                        "
                      >
                        Later Reflection
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-serif italic text-stone-900 leading-relaxed">
                      “
                      {
                        latestDiff.laterPosition
                      }
                      ”
                    </p>
                  </div>
                </div>

                {/* Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                  <div className="mt-overview-changed rounded-xl p-4">

                    <div className="flex items-center gap-2">

                      <div className="mt-analysis-icon-warm">

                        <Layers className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          What Changed
                        </p>

                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Meaningful shift
                          between the two
                          approved positions
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {
                        latestDiff.apparentShift
                      }
                    </p>
                  </div>

                  <div className="mt-overview-consistent rounded-xl p-4">

                    <div className="flex items-center gap-2">

                      <div className="mt-analysis-icon-neutral">

                        <ShieldCheck className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          What Stayed
                          Consistent
                        </p>

                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Evidence that
                          remained stable
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {latestDiff.apparentContinuity ||
                        'MirrorTrace did not identify enough evidence for a stable continuity claim.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">

                  <p className="text-xs text-stone-600">
                    Verified against your
                    original authenticated
                    reflection records.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">

                    <button
                      id="btn-explore-evidence"
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        void handleOpenEvidence(
                          latestDiff
                        );
                      }}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-1.5
                        px-4
                        py-2.5
                        rounded-xl
                        bg-amber-50
                        hover:bg-amber-100
                        text-amber-900
                        border
                        border-amber-300
                        text-xs
                        sm:text-sm
                        font-semibold
                        transition-colors
                      "
                    >
                      <HelpCircle className="w-4 h-4" />

                      Explore the evidence
                    </button>

                    <button
                      id="btn-open-latest-diff"
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        onNavigate(
                          'history',
                          {
                            subTab:
                              'diffs',

                            highlightDiffId:
                              latestDiff.id,
                          }
                        );
                      }}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-5
                        py-2.5
                        rounded-xl
                        bg-amber-800
                        hover:bg-amber-900
                        text-amber-50
                        text-xs
                        sm:text-sm
                        font-semibold
                        transition-colors
                      "
                    >
                      <GitCompare className="w-4 h-4" />

                      Open in History
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="empty-perspective-shift-card"
                className="
                  bg-white
                  border
                  border-dashed
                  border-stone-300
                  rounded-2xl
                  p-8
                  text-center
                  space-y-5
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-amber-50
                    text-amber-800
                    border
                    border-amber-200
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >
                  <GitCompare className="w-6 h-6" />
                </div>

                <div className="max-w-md mx-auto space-y-2">

                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    No perspective shifts
                    detected yet
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    MirrorTrace needs two
                    approved reflections
                    on a related topic
                    before it can compare
                    how your perspective
                    evolved.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(
                        'journal'
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-xl
                      bg-amber-800
                      hover:bg-amber-900
                      text-amber-50
                      text-xs
                      sm:text-sm
                      font-semibold
                    "
                  >
                    <PenLine className="w-4 h-4" />

                    Write a Reflection
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowGuidedDemo(
                        true
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-4
                      py-2
                      rounded-xl
                      bg-stone-100
                      hover:bg-stone-200
                      text-stone-800
                      text-xs
                      sm:text-sm
                      font-semibold
                    "
                  >
                    <PlayCircle className="w-4 h-4 text-amber-800" />

                    See Example Journey
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              QUICK ACTIONS
             ================================================== */}

          <div className="space-y-4 pt-2">

            <h2 className="text-lg font-serif font-bold text-stone-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    'journal'
                  )
                }
                className="mirrortrace-action-card cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">

                  <PenLine className="w-5 h-5" />
                </div>

                <h3 className="mt-3 font-serif text-base font-bold text-stone-900">
                  Write Reflection
                </h3>

                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  Compose a new journal
                  entry or brainstorm
                  with the AI companion.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900">

                  <span>
                    Open Reflect & Chat
                  </span>

                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    'journal',
                    {
                      privateSession:
                        true,
                    }
                  )
                }
                className="mirrortrace-action-card cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center">

                  <EyeOff className="w-5 h-5" />
                </div>

                <div className="mt-3 flex items-center gap-2">

                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Private Session
                  </h3>

                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-900">
                    Ephemeral
                  </span>
                </div>

                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  Reflect freely without
                  saving to Firestore
                  history or generating
                  AI memory.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-purple-900">

                  <span>
                    Start Private Session
                  </span>

                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    'history',
                    {
                      subTab:
                        'reflections',
                    }
                  )
                }
                className="mirrortrace-action-card cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">

                  <History className="w-5 h-5" />
                </div>

                <h3 className="mt-3 font-serif text-base font-bold text-stone-900">
                  Journal History
                </h3>

                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  Browse your private
                  timeline, approved
                  snapshots, and full
                  comparison history.
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-800">

                  <span>
                    Explore History
                  </span>

                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowHowItWorks(
                  true
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-amber-900"
            >
              <Info className="w-4 h-4" />

              How does MirrorTrace work?
            </button>
          </div>

          {/* ==================================================
              HOW IT WORKS
             ================================================== */}

          {showHowItWorks && (
            <div
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                p-4
                bg-stone-900/60
                backdrop-blur-sm
              "
            >
              <div className="mt-overview-modal max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl p-6 space-y-6">

                <div className="flex items-center justify-between border-b border-stone-200 pb-3">

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      How MirrorTrace
                      Works
                    </h3>

                    <p className="text-xs text-stone-600">
                      Version control for
                      your thinking in
                      three evidence-grounded
                      steps.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowHowItWorks(
                        false
                      )
                    }
                    className="p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">

                  <div className="mt-overview-modal-step rounded-xl p-4">

                    <strong className="text-sm text-stone-900">
                      1. Write a
                      Reflection or
                      Brainstorm
                    </strong>

                    <p className="text-xs text-stone-600 mt-1">
                      Reflect normally
                      or use Gemini to
                      help articulate a
                      complicated thought.
                    </p>
                  </div>

                  <div className="mt-overview-modal-step-warm rounded-xl p-4">

                    <strong className="text-sm text-stone-900">
                      2. Approve or Edit
                      a Thought Snapshot
                    </strong>

                    <p className="text-xs text-stone-600 mt-1">
                      Gemini can propose
                      an interpretation,
                      but persistent AI
                      memory requires your
                      explicit approval.
                    </p>
                  </div>

                  <div className="mt-overview-modal-step rounded-xl p-4">

                    <strong className="text-sm text-stone-900">
                      3. Discover
                      Evidence-Backed
                      Thought Diffs
                    </strong>

                    <p className="text-xs text-stone-600 mt-1">
                      Related approved
                      reflections can be
                      compared to show
                      what changed and
                      what stayed
                      consistent.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-100 rounded-xl flex items-start gap-2 text-xs text-stone-600">

                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />

                  <p>
                    MirrorTrace is a
                    reflective tool, not
                    a diagnostic system.
                    Unapproved
                    interpretations never
                    become persistent
                    Thought Snapshots.
                  </p>
                </div>

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowHowItWorks(
                        false
                      )
                    }
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowHowItWorks(
                        false
                      );

                      setShowGuidedDemo(
                        true
                      );
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  >
                    See Example Journey
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowHowItWorks(
                        false
                      );

                      onNavigate(
                        'journal'
                      );
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-800 text-amber-50 hover:bg-amber-900"
                  >
                    Start Writing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              PROVENANCE PREVIEW MODAL
             ================================================== */}

          {selectedDiffForProvenance && (
            <div
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                p-4
                bg-stone-900/60
                backdrop-blur-sm
              "
            >
              <div className="mt-overview-modal max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl p-6 space-y-5">

                <div className="flex items-center justify-between border-b border-stone-200 pb-3">

                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Why am I seeing
                      this?
                    </h3>

                    <p className="text-xs text-stone-600">
                      Exact source
                      reflections and
                      provenance
                      verification
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDiffForProvenance(
                        null
                      )
                    }
                    className="p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingProvenance ? (
                  <div className="py-8 flex flex-col items-center gap-2 text-xs text-stone-500">

                    <div
                      className="
                        w-5
                        h-5
                        border-2
                        border-stone-300
                        border-t-amber-800
                        rounded-full
                        animate-spin
                      "
                    />

                    Loading source
                    provenance...
                  </div>
                ) : provenanceError ? (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800">
                    {
                      provenanceError
                    }
                  </div>
                ) : provenanceData ? (
                  <div className="space-y-4">

                    <div className="mt-overview-modal-step-warm rounded-lg p-3 text-xs text-stone-800">

                      MirrorTrace generated
                      this comparison from
                      your authenticated,
                      user-approved
                      reflections on{' '}

                      <strong>
                        {
                          selectedDiffForProvenance.topic
                        }
                      </strong>
                      .
                    </div>

                    <div className="mt-overview-source-card rounded-lg p-4 space-y-2">

                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">

                        <FileText className="w-4 h-4" />

                        Earlier Reflection
                        Source
                      </div>

                      {provenanceData.earlierDate && (
                        <p className="font-mono text-[10px] text-stone-500">
                          {new Date(
                            provenanceData.earlierDate
                          ).toLocaleString()}
                        </p>
                      )}

                      <blockquote className="font-serif italic text-xs text-stone-800">
                        “
                        {
                          provenanceData.earlierPosition
                        }
                        ”
                      </blockquote>

                      {provenanceData.earlierExcerpt && (
                        <p className="text-xs text-stone-600">
                          {
                            provenanceData.earlierExcerpt
                          }
                          ...
                        </p>
                      )}
                    </div>

                    <div className="mt-overview-source-card-warm rounded-lg p-4 space-y-2">

                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">

                        <FileText className="w-4 h-4" />

                        Later Reflection
                        Source
                      </div>

                      {provenanceData.laterDate && (
                        <p className="font-mono text-[10px] text-stone-500">
                          {new Date(
                            provenanceData.laterDate
                          ).toLocaleString()}
                        </p>
                      )}

                      <blockquote className="font-serif italic text-xs text-stone-800">
                        “
                        {
                          provenanceData.laterPosition
                        }
                        ”
                      </blockquote>

                      {provenanceData.laterExcerpt && (
                        <p className="text-xs text-stone-600">
                          {
                            provenanceData.laterExcerpt
                          }
                          ...
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-stone-100 rounded-lg flex items-start gap-2">

                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />

                      <p className="font-mono text-[10px] text-stone-600">
                        User UID: Verified
                        • Isolation: Owner
                        Namespace • Zero
                        Cross-User
                        Visibility
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDiffForProvenance(
                        null
                      )
                    }
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                  >
                    Close Provenance
                    View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <GuidedDemoModal
          isOpen={
            showGuidedDemo
          }
          onClose={() =>
            setShowGuidedDemo(
              false
            )
          }
          onStartWriting={
            handleStartFromDemo
          }
        />
      </>
    );
  };