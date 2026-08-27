import React, {
  useState,
} from 'react';

import {
  GitCompare,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  X,
  Clock3,
  Fingerprint,
} from 'lucide-react';

import type {
  ThoughtDiff,
  ThoughtDiffProvenance,
  DiffRelationshipStatus,
} from '../types.ts';

import {
  submitDiffFeedback,
  fetchDiffProvenance,
} from '../lib/api.ts';

interface ThoughtDiffCardProps {
  diff: ThoughtDiff;

  initialProvenance?:
    ThoughtDiffProvenance;

  onStatusChange?: (
    newStatus:
      DiffRelationshipStatus
  ) => void;
}

export const ThoughtDiffCard:
  React.FC<ThoughtDiffCardProps> = ({
    diff,
    initialProvenance,
    onStatusChange,
  }) => {
    const [
      provenance,
      setProvenance,
    ] =
      useState<ThoughtDiffProvenance | null>(
        initialProvenance ||
          null
      );

    const [
      showProvenanceModal,
      setShowProvenanceModal,
    ] =
      useState(false);

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

    const [
      status,
      setStatus,
    ] =
      useState<DiffRelationshipStatus>(
        diff.relationshipStatus
      );

    const [
      updatingStatus,
      setUpdatingStatus,
    ] =
      useState(false);

    const [
      statusFeedbackMsg,
      setStatusFeedbackMsg,
    ] =
      useState<string | null>(
        null
      );

    const handleOpenProvenance =
      async () => {
        setShowProvenanceModal(
          true
        );

        if (!provenance) {
          try {
            setLoadingProvenance(
              true
            );

            setProvenanceError(
              null
            );

            const data =
              await fetchDiffProvenance(
                diff.id
              );

            setProvenance(
              data
            );
          } catch (
            err: unknown
          ) {
            setProvenanceError(
              (err as Error)
                ?.message ||
                'Unable to retrieve provenance details at this time.'
            );
          } finally {
            setLoadingProvenance(
              false
            );
          }
        }
      };

    const handleFeedback =
      async (
        newStatus:
          DiffRelationshipStatus
      ) => {
        try {
          setUpdatingStatus(
            true
          );

          setStatusFeedbackMsg(
            null
          );

          await submitDiffFeedback(
            diff.id,
            newStatus
          );

          setStatus(
            newStatus
          );

          onStatusChange?.(
            newStatus
          );

          if (
            newStatus ===
            'useful'
          ) {
            setStatusFeedbackMsg(
              'Marked as helpful and accurate.'
            );
          } else if (
            newStatus ===
            'not_related'
          ) {
            setStatusFeedbackMsg(
              'Marked as not related. Excluded from future comparisons.'
            );
          } else if (
            newStatus ===
            'incorrect_interpretation'
          ) {
            setStatusFeedbackMsg(
              'Feedback recorded. Interpretation flagged.'
            );
          }

          window.setTimeout(
            () =>
              setStatusFeedbackMsg(
                null
              ),
            3500
          );
        } catch (
          err: unknown
        ) {
          console.error(
            'Failed to submit diff feedback:',
            err
          );

          setStatusFeedbackMsg(
            'Could not save feedback. Please try again.'
          );

          window.setTimeout(
            () =>
              setStatusFeedbackMsg(
                null
              ),
            3500
          );
        } finally {
          setUpdatingStatus(
            false
          );
        }
      };

    return (
      <>
        <article
          id={`thought-diff-${diff.id}`}
          className="mt-diff-shell animate-fade-in"
        >
          {/* Header */}
          <div className="mt-diff-header px-5 py-4 sm:px-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-amber-900
                    text-amber-50
                    shadow-sm
                  "
                >
                  <GitCompare className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-serif text-lg font-bold tracking-tight text-stone-950">
                      Thought Diff
                    </h3>

                    <span
                      className="
                        rounded-full
                        border
                        border-amber-300
                        bg-amber-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        text-amber-950
                      "
                    >
                      {diff.topic}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    Evidence-grounded
                    perspective evolution
                    between approved
                    reflections.
                  </p>
                </div>
              </div>

              <button
                id={`btn-why-seeing-diff-${diff.id}`}
                type="button"
                onClick={
                  handleOpenProvenance
                }
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-amber-300
                  bg-white
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-amber-900
                  transition-colors
                  hover:bg-amber-100
                "
              >
                <HelpCircle className="h-4 w-4" />

                Why am I seeing this?
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">

            {/* Timeline */}
            <section>

              <div className="mb-3 flex items-center gap-2">

                <Clock3 className="h-4 w-4 text-stone-500" />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-stone-500
                  "
                >
                  Perspective Timeline
                </span>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  items-stretch
                  gap-3

                  md:grid-cols-[1fr_auto_1fr]
                "
              >

                {/* Earlier */}
                <div className="mt-diff-earlier rounded-2xl p-4 sm:p-5">

                  <div className="flex items-center justify-between gap-2">

                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Earlier Stance
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-stone-100
                        px-2
                        py-1
                        text-[9px]
                        font-semibold
                        text-stone-600
                      "
                    >
                      Previous
                    </span>
                  </div>

                  <p
                    className="
                      mt-3
                      font-serif
                      text-sm
                      italic
                      leading-relaxed
                      text-stone-800

                      sm:text-base
                    "
                  >
                    “
                    {
                      diff.earlierPosition
                    }
                    ”
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    py-1

                    md:px-1
                    md:py-0
                  "
                >
                  <div
                    className="
                      absolute
                      hidden
                      h-px
                      w-full
                      bg-amber-200

                      md:block
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-amber-300
                      bg-amber-100
                      text-amber-900
                      shadow-sm
                    "
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* Current */}
                <div className="mt-diff-current rounded-2xl p-4 sm:p-5">

                  <div className="flex items-center justify-between gap-2">

                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Current Stance
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-amber-200
                        px-2
                        py-1
                        text-[9px]
                        font-bold
                        text-amber-950
                      "
                    >
                      Now
                    </span>
                  </div>

                  <p
                    className="
                      mt-3
                      font-serif
                      text-sm
                      italic
                      leading-relaxed
                      text-stone-950

                      sm:text-base
                    "
                  >
                    “
                    {
                      diff.laterPosition
                    }
                    ”
                  </p>
                </div>
              </div>
            </section>

            {/* Analysis */}
            <section
              className="
                grid
                grid-cols-1
                gap-3

                lg:grid-cols-2
              "
            >

              {/* Changed */}
              <div className="mt-diff-changed rounded-2xl p-4">

                <div className="flex items-center gap-2">

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-amber-100
                      text-amber-900
                    "
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-950">
                      What Changed
                    </h4>

                    <p className="text-[10px] text-stone-500">
                      The meaningful shift
                      detected across
                      reflections
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-stone-700 sm:text-sm">
                  {diff.apparentShift}
                </p>
              </div>

              {/* Stable */}
              <div className="mt-diff-stable rounded-2xl p-4">

                <div className="flex items-center gap-2">

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-stone-100
                      text-stone-700
                    "
                  >
                    <Layers className="h-4 w-4" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-950">
                      What Stayed
                      Consistent
                    </h4>

                    <p className="text-[10px] text-stone-500">
                      Elements that
                      remained stable
                      over time
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-stone-700 sm:text-sm">
                  {diff.apparentContinuity ||
                    'MirrorTrace did not identify enough evidence for a stable continuity claim.'}
                </p>
              </div>
            </section>

            {/* Evidence */}
            <section className="mt-diff-evidence rounded-2xl p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-2">

                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Evidence-backed
                      comparison
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-stone-400">
                      Generated only from
                      your authenticated,
                      user-approved
                      reflection history.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleOpenProvenance
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-stone-700
                    bg-stone-900
                    px-3
                    py-2
                    text-[10px]
                    font-semibold
                    text-stone-200
                    transition-colors
                    hover:border-amber-500
                    hover:text-white
                  "
                >
                  <Fingerprint className="h-3.5 w-3.5" />

                  Inspect provenance
                </button>
              </div>
            </section>

            {/* Feedback */}
            <section className="border-t border-stone-200 pt-4">

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                <div>
                  <p className="text-xs font-semibold text-stone-800">
                    Does this comparison
                    reflect your thinking
                    accurately?
                  </p>

                  <p className="mt-1 text-[10px] text-stone-500">
                    Your feedback helps
                    keep future comparisons
                    grounded.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    id={`btn-diff-useful-${diff.id}`}
                    type="button"
                    onClick={() =>
                      handleFeedback(
                        'useful'
                      )
                    }
                    disabled={
                      updatingStatus
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                      status ===
                        'useful' ||
                      status ===
                        'verified'
                        ? 'border border-emerald-300 bg-emerald-100 text-emerald-900'
                        : 'border border-stone-200 bg-white text-stone-700 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />

                    Correct / useful
                  </button>

                  <button
                    id={`btn-diff-not-related-${diff.id}`}
                    type="button"
                    onClick={() =>
                      handleFeedback(
                        'not_related'
                      )
                    }
                    disabled={
                      updatingStatus
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                      status ===
                      'not_related'
                        ? 'border border-stone-400 bg-stone-200 text-stone-900'
                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5 text-stone-500" />

                    Not related
                  </button>

                  <button
                    id={`btn-diff-incorrect-${diff.id}`}
                    type="button"
                    onClick={() =>
                      handleFeedback(
                        'incorrect_interpretation'
                      )
                    }
                    disabled={
                      updatingStatus
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                      status ===
                      'incorrect_interpretation'
                        ? 'border border-red-300 bg-red-100 text-red-900'
                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-red-50'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />

                    Incorrect
                    interpretation
                  </button>
                </div>
              </div>

              {statusFeedbackMsg && (
                <div
                  className={`mt-3 rounded-xl border px-3 py-2 text-[11px] font-medium animate-fade-in ${
                    statusFeedbackMsg.startsWith(
                      'Could not'
                    )
                      ? 'border-red-200 bg-red-50 text-red-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {statusFeedbackMsg}
                </div>
              )}
            </section>
          </div>
        </article>

        {/* Provenance Modal */}
        {showProvenanceModal && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-stone-950/70
              p-4
              backdrop-blur-sm
              animate-fade-in
            "
          >
            <div
              className="
                mt-diff-modal
                mirrortrace-modal-scroll
                max-h-[88vh]
                w-full
                max-w-2xl
                overflow-y-auto
                rounded-[26px]
                shadow-2xl
              "
            >

              {/* Modal Header */}
              <div
                className="
                  mt-diff-modal-header
                  sticky
                  top-0
                  z-10
                  flex
                  items-start
                  justify-between
                  gap-4
                  border-b
                  border-stone-200
                  px-5
                  py-4
                  backdrop-blur-md

                  sm:px-6
                "
              >
                <div className="flex items-start gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-amber-800
                      text-amber-50
                    "
                  >
                    <HelpCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-950">
                      Why am I seeing
                      this?
                    </h3>

                    <p className="mt-1 text-xs text-stone-500">
                      Exact source
                      reflections and
                      provenance
                      verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowProvenanceModal(
                      false
                    )
                  }
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Close provenance view"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">

                {loadingProvenance ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs text-stone-500">

                    <div
                      className="
                        h-6
                        w-6
                        animate-spin
                        rounded-full
                        border-2
                        border-stone-300
                        border-t-amber-800
                      "
                    />

                    Loading source
                    provenance record...
                  </div>
                ) : provenanceError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                    {
                      provenanceError
                    }
                  </div>
                ) : provenance ? (
                  <>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-stone-800">
                      MirrorTrace generated
                      this comparison
                      strictly by matching
                      your own authenticated,
                      user-approved
                      reflections on the
                      topic{' '}
                      <strong>
                        “{diff.topic}”
                      </strong>
                      . No external data,
                      hidden psychological
                      assumptions, or other
                      users’ entries were
                      accessed.
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                      {/* Earlier Source */}
                      <div className="mt-diff-source-earlier rounded-2xl p-4">

                        <div className="flex items-center justify-between gap-2">

                          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">

                            <FileText className="h-4 w-4 text-stone-500" />

                            Earlier Reflection
                          </div>

                          {provenance.earlierDate && (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-stone-400">

                              <Calendar className="h-3 w-3" />

                              {new Date(
                                provenance.earlierDate
                              ).toLocaleString(
                                undefined,
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
                                    '2-digit',
                                }
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mt-4">

                          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400">
                            Approved stance
                          </p>

                          <blockquote
                            className="
                              mt-2
                              rounded-xl
                              border
                              border-stone-200
                              bg-stone-50
                              p-3
                              font-serif
                              text-sm
                              italic
                              leading-relaxed
                              text-stone-800
                            "
                          >
                            “
                            {
                              provenance.earlierPosition
                            }
                            ”
                          </blockquote>
                        </div>

                        {provenance.earlierExcerpt && (
                          <div className="mt-4 border-t border-stone-100 pt-3">

                            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400">
                              Source excerpt
                            </p>

                            <p className="mt-2 text-xs leading-relaxed text-stone-600">
                              {
                                provenance.earlierExcerpt
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Later Source */}
                      <div className="mt-diff-source-later rounded-2xl p-4">

                        <div className="flex items-center justify-between gap-2">

                          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">

                            <FileText className="h-4 w-4 text-amber-800" />

                            Later Reflection
                          </div>

                          {provenance.laterDate && (
                            <span className="flex items-center gap-1 font-mono text-[9px] text-stone-400">

                              <Calendar className="h-3 w-3 text-amber-800" />

                              {new Date(
                                provenance.laterDate
                              ).toLocaleString(
                                undefined,
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
                                    '2-digit',
                                }
                              )}
                            </span>
                          )}
                        </div>

                        <div className="mt-4">

                          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800">
                            Approved stance
                          </p>

                          <blockquote
                            className="
                              mt-2
                              rounded-xl
                              border
                              border-amber-200
                              bg-white
                              p-3
                              font-serif
                              text-sm
                              italic
                              leading-relaxed
                              text-stone-900
                            "
                          >
                            “
                            {
                              provenance.laterPosition
                            }
                            ”
                          </blockquote>
                        </div>

                        {provenance.laterExcerpt && (
                          <div className="mt-4 border-t border-amber-200 pt-3">

                            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800">
                              Source excerpt
                            </p>

                            <p className="mt-2 text-xs leading-relaxed text-stone-600">
                              {
                                provenance.laterExcerpt
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-diff-evidence rounded-2xl p-4">

                      <div className="flex items-start gap-2">

                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                        <div>
                          <p className="text-xs font-bold text-white">
                            Provenance
                            Integrity
                            Guarantee
                          </p>

                          <p className="mt-1 font-mono text-[10px] leading-relaxed text-stone-400">
                            User UID:
                            Verified •
                            Isolation: Owner
                            Namespace • Zero
                            Cross-User
                            Visibility
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-end border-t border-stone-200 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      setShowProvenanceModal(
                        false
                      )
                    }
                    className="
                      rounded-xl
                      bg-stone-950
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-white
                      transition-colors
                      hover:bg-stone-800
                    "
                  >
                    Close Provenance
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };