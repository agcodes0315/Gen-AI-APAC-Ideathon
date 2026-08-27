import React from 'react';

import {
  ArrowRight,
  BookOpen,
  Check,
  GitCompare,
  ShieldCheck,
  Sparkles,
  X,
  PenLine,
  Eye,
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;

  onClose: () => void;

  onStartWriting:
    () => void;
}

export const GuidedDemoModal:
  React.FC<GuidedDemoModalProps> = ({
    isOpen,
    onClose,
    onStartWriting,
  }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div
        className="
          fixed
          inset-0
          z-[70]
          flex
          items-center
          justify-center
          bg-stone-950/70
          px-4
          py-6
          backdrop-blur-sm
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-demo-title"
      >
        <div
          className="
            mt-demo-shell
            mirrortrace-modal-scroll
            max-h-[92vh]
            w-full
            max-w-5xl
            overflow-y-auto
            rounded-[28px]
            shadow-2xl
          "
        >

          {/* Header */}
          <div
            className="
              mt-demo-header
              sticky
              top-0
              z-10
              border-b
              border-stone-200
              px-5
              py-4
              backdrop-blur-md

              sm:px-7
            "
          >
            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-amber-300
                    bg-amber-100
                    text-amber-900
                  "
                >
                  <GitCompare className="h-5 w-5" />
                </div>

                <div>

                  <div className="mb-1 flex flex-wrap items-center gap-2">

                    <h2
                      id="guided-demo-title"
                      className="
                        font-serif
                        text-xl
                        font-bold
                        text-stone-950

                        sm:text-2xl
                      "
                    >
                      See MirrorTrace in
                      Action
                    </h2>

                    <span
                      className="
                        rounded-full
                        border
                        border-amber-300
                        bg-amber-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-amber-950
                      "
                    >
                      Fictional Demo
                    </span>
                  </div>

                  <p className="max-w-2xl text-xs leading-relaxed text-stone-600 sm:text-sm">
                    A 30-second example
                    showing how
                    MirrorTrace turns two
                    user-approved
                    reflections into an
                    evidence-backed
                    perspective change.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  onClose
                }
                className="
                  rounded-xl
                  p-2
                  text-stone-400
                  transition-colors
                  hover:bg-stone-100
                  hover:text-stone-800
                "
                aria-label="Close guided demo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-7">

            {/* Privacy notice */}
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50/70
                p-4
              "
            >
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Demo-only data
                </p>

                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                  Nothing shown below is
                  written to your journal,
                  Firestore, Thought
                  Snapshots, Thought Diffs,
                  or personal AI memory.
                </p>
              </div>
            </div>

            {/* STEP 1 */}
            <section className="space-y-3">

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-stone-900
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  1
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-stone-950">
                    First reflection
                  </h3>

                  <p className="text-xs text-stone-500">
                    The user is still
                    exploring two possible
                    paths.
                  </p>
                </div>
              </div>

              <div className="mt-demo-reflection rounded-2xl p-5 shadow-sm">

                <div className="mb-3 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">

                    <BookOpen className="h-4 w-4 text-stone-500" />

                    Reflection
                  </div>

                  <span className="font-mono text-[10px] text-stone-400">
                    AUG 05 · 8:40 PM
                  </span>
                </div>

                <p className="font-serif text-base leading-relaxed text-stone-900 sm:text-lg">
                  “I’m unsure whether I
                  should pursue an MBA
                  immediately after
                  engineering or work in
                  technology first.”
                </p>
              </div>

              <div
                className="
                  mt-demo-snapshot
                  ml-0
                  rounded-2xl
                  p-5

                  sm:ml-10
                "
              >

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-amber-800" />

                    <span className="text-xs font-bold text-amber-950">
                      Gemini proposes a
                      Thought Snapshot
                    </span>
                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-emerald-100
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      text-emerald-800
                    "
                  >
                    <Check className="h-3 w-3" />

                    User approved
                  </span>
                </div>

                <p className="font-serif text-sm italic leading-relaxed text-stone-800">
                  “The user is evaluating
                  whether to pursue an MBA
                  immediately or gain
                  technology industry
                  experience first.”
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">

                  {[
                    'mba',
                    'technology',
                    'career',
                  ].map(
                    (tag) => (
                      <span
                        key={
                          tag
                        }
                        className="
                          rounded-full
                          border
                          border-amber-200
                          bg-white
                          px-2.5
                          py-1
                          text-amber-900
                        "
                      >
                        #{tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Connector */}
            <div className="flex items-center gap-3 px-2">

              <div
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-transparent
                  via-amber-300
                  to-amber-300
                "
              />

              <div
                className="
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
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>

              <div
                className="
                  h-px
                  flex-1
                  bg-gradient-to-r
                  from-amber-300
                  via-amber-300
                  to-transparent
                "
              />
            </div>

            {/* STEP 2 */}
            <section className="space-y-3">

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-stone-900
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  2
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-stone-950">
                    Later reflection
                  </h3>

                  <p className="text-xs text-stone-500">
                    The user returns to
                    the topic with a more
                    specific position.
                  </p>
                </div>
              </div>

              <div className="mt-demo-reflection rounded-2xl p-5 shadow-sm">

                <div className="mb-3 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">

                    <BookOpen className="h-4 w-4 text-stone-500" />

                    Reflection
                  </div>

                  <span className="font-mono text-[10px] text-stone-400">
                    AUG 27 · 9:15 PM
                  </span>
                </div>

                <p className="font-serif text-base leading-relaxed text-stone-900 sm:text-lg">
                  “After working on real
                  technical projects, I
                  think spending two years
                  in technology first
                  would help me understand
                  what business problems
                  I actually care about
                  before choosing an MBA.”
                </p>
              </div>

              <div
                className="
                  mt-demo-snapshot
                  ml-0
                  rounded-2xl
                  p-5

                  sm:ml-10
                "
              >

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-amber-800" />

                    <span className="text-xs font-bold text-amber-950">
                      Gemini proposes a
                      Thought Snapshot
                    </span>
                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-emerald-100
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      text-emerald-800
                    "
                  >
                    <Check className="h-3 w-3" />

                    User approved
                  </span>
                </div>

                <p className="font-serif text-sm italic leading-relaxed text-stone-800">
                  “The user now prefers
                  gaining practical
                  technology experience
                  before deciding whether
                  and how to pursue an
                  MBA.”
                </p>
              </div>
            </section>

            {/* STEP 3 */}
            <section className="space-y-3">

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-800
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  3
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-stone-950">
                    MirrorTrace creates a
                    Thought Diff
                  </h3>

                  <p className="text-xs text-stone-500">
                    Only the two approved
                    snapshots are eligible
                    for comparison.
                  </p>
                </div>
              </div>

              <div className="mt-demo-diff overflow-hidden rounded-[24px] shadow-sm">

                <div className="mt-demo-diff-header border-b border-amber-200 px-5 py-4">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                      <div className="mb-1 flex items-center gap-2">

                        <GitCompare className="h-4 w-4 text-amber-900" />

                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-950">
                          Thought Diff
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-stone-950">
                        MBA Timing &
                        Career Strategy
                      </h4>
                    </div>

                    <span
                      className="
                        rounded-full
                        border
                        border-amber-300
                        bg-white
                        px-3
                        py-1
                        text-[10px]
                        font-semibold
                        text-amber-900
                      "
                    >
                      Evidence-backed
                    </span>
                  </div>
                </div>

                <div className="p-5">

                  <div
                    className="
                      grid
                      grid-cols-1
                      items-stretch
                      gap-3

                      md:grid-cols-[1fr_auto_1fr]
                    "
                  >

                    <div className="mt-demo-reflection rounded-2xl p-4">

                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Earlier
                      </span>

                      <p className="mt-2 font-serif text-sm italic leading-relaxed text-stone-800">
                        “The user is still
                        evaluating an
                        immediate MBA versus
                        entering technology
                        first.”
                      </p>
                    </div>

                    <div className="flex items-center justify-center">

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-amber-300
                          bg-amber-100
                          text-amber-900
                        "
                      >
                        <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
                      </div>
                    </div>

                    <div className="mt-demo-snapshot rounded-2xl p-4">

                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900">
                        Current
                      </span>

                      <p className="mt-2 font-serif text-sm italic leading-relaxed text-stone-900">
                        “The user now
                        prefers technology
                        experience before
                        deciding on an MBA.”
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

                    <div className="mt-demo-reflection rounded-2xl p-4">

                      <div className="mb-2 flex items-center gap-2">

                        <Sparkles className="h-4 w-4 text-amber-800" />

                        <p className="text-xs font-bold text-stone-900">
                          What Changed
                        </p>
                      </div>

                      <p className="text-xs leading-relaxed text-stone-600">
                        The position moved
                        from open-ended
                        comparison toward a
                        concrete sequencing
                        preference:
                        practical industry
                        experience first.
                      </p>
                    </div>

                    <div className="mt-demo-reflection rounded-2xl p-4">

                      <div className="mb-2 flex items-center gap-2">

                        <Eye className="h-4 w-4 text-stone-600" />

                        <p className="text-xs font-bold text-stone-900">
                          What Stayed
                          Consistent
                        </p>
                      </div>

                      <p className="text-xs leading-relaxed text-stone-600">
                        Interest in both
                        technology and
                        business remains
                        central to the
                        user’s long-term
                        decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Provenance */}
            <section className="mt-demo-provenance rounded-[24px] p-5 text-stone-100 sm:p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="max-w-2xl">

                  <div className="mb-2 flex items-center gap-2">

                    <ShieldCheck className="h-5 w-5 text-emerald-400" />

                    <h3 className="font-serif text-base font-bold text-white">
                      Every conclusion
                      remains traceable
                    </h3>
                  </div>

                  <p className="text-xs leading-relaxed text-stone-300">
                    Open “Why am I seeing
                    this?” to inspect the
                    exact earlier and later
                    source reflections,
                    approved snapshots,
                    chronology, and
                    owner-isolated
                    provenance.
                  </p>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2 text-[10px]">

                  {[
                    '✓ User approved',
                    '✓ Owner isolated',
                    '✓ Distinct sources',
                    '✓ Chronological',
                  ].map(
                    (item) => (
                      <span
                        key={
                          item
                        }
                        className="
                          rounded-lg
                          border
                          border-stone-700
                          bg-stone-900
                          px-3
                          py-2
                          text-center
                          text-stone-200
                        "
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Footer */}
            <div
              className="
                flex
                flex-col-reverse
                justify-between
                gap-3
                border-t
                border-stone-200
                pt-5

                sm:flex-row
                sm:items-center
              "
            >

              <p className="max-w-xl text-[11px] leading-relaxed text-stone-500">
                Example data is local
                presentation content
                only. It never enters
                your authenticated
                MirrorTrace data.
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={
                    onClose
                  }
                  className="
                    rounded-xl
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-stone-600
                    transition-colors
                    hover:bg-stone-100
                  "
                >
                  Close Demo
                </button>

                <button
                  type="button"
                  onClick={
                    onStartWriting
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-amber-800
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-amber-50
                    shadow-sm
                    transition-all
                    hover:bg-amber-900
                    hover:shadow-md
                  "
                >
                  <PenLine className="h-4 w-4" />

                  Try MirrorTrace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };