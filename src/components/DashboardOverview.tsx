import '../styles/mirrortrace-clean-glass.css';

import React, {
  useState,
} from 'react';

import {
  ArrowRight,
  BookOpen,
  Calendar,
  EyeOff,
  FileText,
  GitCompare,
  HelpCircle,
  History,
  Info,
  Layers,
  PenLine,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

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
  entries:
    JournalEntry[];

  snapshots:
    ThoughtSnapshot[];

  diffs:
    ThoughtDiff[];

  loading:
    boolean;

  onNavigate: (
    tab:
      | 'overview'
      | 'journal'
      | 'history'
      | 'memory'
      | 'support'
      | 'feedback',
    options?:
      DashboardNavigationOptions
  ) => void;
}

function AnimatedNumber(
  props: {
    value:
      number;
    loading:
      boolean;
  }
) {
  return (
    <motion.span
      key={
        props.loading
          ? 'loading'
          : props.value
      }
      initial={{
        opacity:
          0,
        y:
          8,
      }}
      animate={{
        opacity:
          1,
        y:
          0,
      }}
      className="text-3xl font-serif font-bold text-stone-900"
    >
      {props.loading
        ? '—'
        : props.value}
    </motion.span>
  );
}

export const DashboardOverview:
  React.FC<
    DashboardOverviewProps
  > = ({
    entries,
    snapshots,
    diffs,
    loading,
    onNavigate,
  }) => {
    const reducedMotion =
      useReducedMotion();

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
        diff:
          ThoughtDiff
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
          err:
            unknown
        ) {
          setProvenanceError(
            (
              err as
                Error
            )
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
        <div className="mirrortrace-dashboard-overview space-y-8">

          {/* CINEMATIC DASHBOARD HERO */}

          <motion.section
            initial={{
              opacity:
                0,
              y:
                reducedMotion
                  ? 0
                  : 20,
            }}
            animate={{
              opacity:
                1,
              y:
                0,
            }}
            transition={{
              duration:
                0.65,
            }}
            className="mirrortrace-user-hero mirrortrace-clean-glass-hero relative overflow-hidden rounded-[32px] px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10"
          >
<div className="mirrortrace-hero-content relative z-10 grid gap-8">

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75 backdrop-blur-lg">

                  <GitCompare className="h-3.5 w-3.5 text-amber-300" />

                  Version control for your thinking
                </div>

                <h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl mirrortrace-float-title">
                  Your thinking,
                  <span className="block text-amber-200">
                    versioned.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/82 sm:text-base mirrortrace-overview-copy">
                  Track how your ideas evolve with consent, evidence, and complete control over AI memory.
                </p>

                <div className="mt-7 flex flex-wrap gap-3 mirrortrace-float-actions">

                  <motion.button
                    type="button"
                    whileHover={
                      reducedMotion
                        ? undefined
                        : {
                            y:
                              -3,
                          }
                    }
                    whileTap={{
                      scale:
                        0.98,
                    }}
                    onClick={() =>
                      onNavigate(
                        'journal'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950"
                  >
                    <PenLine className="h-4 w-4" />

                    Write a Reflection
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={
                      reducedMotion
                        ? undefined
                        : {
                            y:
                              -3,
                          }
                    }
                    onClick={() =>
                      onNavigate(
                        'memory'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-lg"
                  >
                    <Sparkles className="h-4 w-4 text-amber-200" />

                    Open Memory
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.section>

          {/* KPI CARDS */}

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
                      : 0.08,
                },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
          >

            {[
              {
                id:
                  'stat-reflections',
                label:
                  'Reflections',
                detail:
                  'Your private journal',
                suffix:
                  'saved',
                value:
                  reflectionsCount,
                icon:
                  BookOpen,
                onClick:
                  () =>
                    onNavigate(
                      'history',
                      {
                        subTab:
                          'reflections',
                      }
                    ),
              },
              {
                id:
                  'stat-snapshots',
                label:
                  'Approved Snapshots',
                detail:
                  'Only interpretations you approved',
                suffix:
                  'structured',
                value:
                  approvedSnapshotsCount,
                icon:
                  Sparkles,
                onClick:
                  () =>
                    onNavigate(
                      'memory'
                    ),
              },
              {
                id:
                  'stat-diffs',
                label:
                  'Thought Diffs',
                detail:
                  'Evidence-backed perspective changes',
                suffix:
                  'comparisons',
                value:
                  thoughtDiffsCount,
                icon:
                  GitCompare,
                onClick:
                  () =>
                    onNavigate(
                      'history',
                      {
                        subTab:
                          'diffs',
                      }
                    ),
              },
            ].map(
              (
                card
              ) => {
                const Icon =
                  card.icon;

                return (
                  <motion.button
                    key={
                      card.id
                    }
                    id={
                      card.id
                    }
                    variants={{
                      hidden: {
                        opacity:
                          0,
                        y:
                          18,
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
                            scale:
                              1.01,
                          }
                    }
                    whileTap={{
                      scale:
                        0.985,
                    }}
                    type="button"
                    onClick={
                      card.onClick
                    }
                    className="mirrortrace-stat-card group rounded-[26px] border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-stone-700">
                        {card.label}
                      </span>

                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-600 transition-colors group-hover:bg-amber-100 group-hover:text-amber-900">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <AnimatedNumber
                        value={
                          card.value
                        }
                        loading={
                          loading
                        }
                      />

                      <span className="text-xs font-medium text-stone-600">
                        {card.suffix}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-stone-600">
                      {card.detail}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-amber-900 opacity-0 transition-opacity group-hover:opacity-100">
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.button>
                );
              }
            )}
          </motion.div>

          {/* PERSPECTIVE EVOLUTION */}

          <motion.section
            initial={{
              opacity:
                0,
              y:
                reducedMotion
                  ? 0
                  : 24,
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
              amount:
                0.15,
            }}
            transition={{
              duration:
                0.55,
            }}
            className="space-y-4"
          >

            <div className="flex items-center justify-between">

              <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-stone-900">
                <GitCompare className="h-5 w-5 text-amber-800" />
                Perspective Evolution
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
                  className="flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline"
                >
                  View all {thoughtDiffsCount}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {latestDiff ? (
              <motion.div
                whileHover={
                  reducedMotion
                    ? undefined
                    : {
                        y:
                          -3,
                      }
                }
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
                className="cursor-pointer rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
              >

                <div className="flex flex-col justify-between gap-3 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-center">

                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
                      <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                      Your thinking is evolving
                    </span>

                    <h3 className="mt-2 font-serif text-lg font-bold text-stone-900 sm:text-xl">
                      Topic: {latestDiff.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                    Diff generated{' '}
                    {new Date(
                      latestDiff.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-11">

                  <div className="rounded-2xl bg-stone-50 p-4 md:col-span-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Earlier stance
                    </div>

                    <p className="mt-2 font-serif text-sm italic leading-relaxed text-stone-800">
                      “{latestDiff.earlierPosition}”
                    </p>
                  </div>

                  <div className="flex justify-center md:col-span-1">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-amber-300 bg-amber-100 text-amber-900">
                      <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:col-span-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Current stance
                    </div>

                    <p className="mt-2 font-serif text-sm italic leading-relaxed text-stone-900">
                      “{latestDiff.laterPosition}”
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">

                  <div className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-amber-800" />
                      <strong className="text-xs text-stone-900">
                        What Changed
                      </strong>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-stone-700 sm:text-sm">
                      {latestDiff.apparentShift}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <strong className="text-xs text-stone-900">
                        What Stayed Consistent
                      </strong>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-stone-700 sm:text-sm">
                      {latestDiff.apparentContinuity ||
                        'MirrorTrace did not identify enough evidence for a stable continuity claim.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-stone-500">
                    Verified against your original authenticated reflection records.
                  </p>

                  <button
                    type="button"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      void handleOpenEvidence(
                        latestDiff
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Explore the evidence
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-stone-300 bg-white p-8 text-center">

                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800">
                  <GitCompare className="h-6 w-6" />
                </div>

                <h3 className="mt-5 font-serif text-lg font-bold text-stone-900">
                  No perspective shifts detected yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                  MirrorTrace needs two approved reflections on a related topic before it can compare how your perspective evolved.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(
                        'journal'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-amber-50"
                  >
                    <PenLine className="h-4 w-4" />
                    Write a Reflection
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowGuidedDemo(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800"
                  >
                    <PlayCircle className="h-4 w-4 text-amber-800" />
                    See Example Journey
                  </button>
                </div>
              </div>
            )}
          </motion.section>

          {/* QUICK ACTIONS */}

          <motion.section
            initial={{
              opacity:
                0,
              y:
                reducedMotion
                  ? 0
                  : 24,
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
              amount:
                0.15,
            }}
            className="space-y-4 pt-2"
          >
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Quick Actions
            </h2>

            <div className="grid gap-4 md:grid-cols-3">

              {[
                {
                  title:
                    'Write Reflection',
                  body:
                    'Compose a new journal entry or brainstorm with the AI companion.',
                  action:
                    'Open Reflect & Chat',
                  icon:
                    PenLine,
                  onClick:
                    () =>
                      onNavigate(
                        'journal'
                      ),
                },
                {
                  title:
                    'Private Session',
                  body:
                    'Reflect freely without saving to Firestore history or generating AI memory.',
                  action:
                    'Start Private Session',
                  icon:
                    EyeOff,
                  onClick:
                    () =>
                      onNavigate(
                        'journal',
                        {
                          privateSession:
                            true,
                        }
                      ),
                },
                {
                  title:
                    'Journal History',
                  body:
                    'Browse your private timeline, approved snapshots, and full comparison history.',
                  action:
                    'Explore History',
                  icon:
                    History,
                  onClick:
                    () =>
                      onNavigate(
                        'history',
                        {
                          subTab:
                            'reflections',
                        }
                      ),
                },
              ].map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <motion.button
                      key={
                        item.title
                      }
                      whileHover={
                        reducedMotion
                          ? undefined
                          : {
                              y:
                                -6,
                            }
                      }
                      type="button"
                      onClick={
                        item.onClick
                      }
                      className="group rounded-[26px] border border-stone-200 bg-white p-5 text-left shadow-sm hover:shadow-xl"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-900">
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="mt-4 font-serif text-base font-bold text-stone-900">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-stone-600">
                        {item.body}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-semibold text-amber-900">
                        <span>
                          {item.action}
                        </span>

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.button>
                  );
                }
              )}
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
              <Info className="h-4 w-4" />
              How does MirrorTrace work?
            </button>
          </motion.section>

          {/* HOW IT WORKS MODAL */}

          {showHowItWorks && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">

              <motion.div
                initial={{
                  opacity:
                    0,
                  scale:
                    reducedMotion
                      ? 1
                      : 0.97,
                }}
                animate={{
                  opacity:
                    1,
                  scale:
                    1,
                }}
                className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      How MirrorTrace Works
                    </h3>
                    <p className="text-xs text-stone-600">
                      Version control for your thinking in three evidence-grounded steps.
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
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-stone-50 p-4">
                    <strong className="text-sm text-stone-900">
                      1. Write a Reflection or Brainstorm
                    </strong>
                    <p className="mt-1 text-xs text-stone-600">
                      Reflect normally or use Gemini to help articulate a complicated thought.
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <strong className="text-sm text-stone-900">
                      2. Approve or Edit a Thought Snapshot
                    </strong>
                    <p className="mt-1 text-xs text-stone-600">
                      Gemini can propose an interpretation, but persistent AI memory requires your explicit approval.
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 p-4">
                    <strong className="text-sm text-stone-900">
                      3. Discover Evidence-Backed Thought Diffs
                    </strong>
                    <p className="mt-1 text-xs text-stone-600">
                      Related approved reflections can be compared to show what changed and what stayed consistent.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowHowItWorks(
                        false
                      )
                    }
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
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
                    className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900"
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
                    className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-amber-50"
                  >
                    Start Writing
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* PROVENANCE MODAL */}

          {selectedDiffForProvenance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">

              <motion.div
                initial={{
                  opacity:
                    0,
                  scale:
                    reducedMotion
                      ? 1
                      : 0.97,
                }}
                animate={{
                  opacity:
                    1,
                  scale:
                    1,
                }}
                className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Why am I seeing this?
                    </h3>
                    <p className="text-xs text-stone-600">
                      Exact source reflections and provenance verification
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
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {loadingProvenance ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-xs text-stone-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-amber-800" />
                    Loading source provenance...
                  </div>
                ) : provenanceError ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                    {provenanceError}
                  </div>
                ) : provenanceData ? (
                  <div className="mt-4 space-y-4">

                    <div className="rounded-lg bg-amber-50 p-3 text-xs text-stone-800">
                      MirrorTrace generated this comparison from your authenticated, user-approved reflections on{' '}
                      <strong>
                        {selectedDiffForProvenance.topic}
                      </strong>
                      .
                    </div>

                    <div className="rounded-lg border border-stone-200 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                        <FileText className="h-4 w-4" />
                        Earlier Reflection Source
                      </div>

                      <blockquote className="mt-2 font-serif text-xs italic text-stone-800">
                        “{provenanceData.earlierPosition}”
                      </blockquote>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                        <FileText className="h-4 w-4" />
                        Later Reflection Source
                      </div>

                      <blockquote className="mt-2 font-serif text-xs italic text-stone-800">
                        “{provenanceData.laterPosition}”
                      </blockquote>
                    </div>

                    <div className="rounded-lg bg-stone-100 p-3 text-[10px] text-stone-600">
                      <ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-700" />
                      User UID: Verified • Isolation: Owner Namespace • Zero Cross-User Visibility
                    </div>
                  </div>
                ) : null}
              </motion.div>
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
