import React from 'react';

import {
  Briefcase,
  GraduationCap,
  Rocket,
  Brain,
  GitCompare,
  ShieldCheck,
  History,
  Sparkles,
} from 'lucide-react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

type AudienceCard = {
  id: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
};

const AUDIENCES: AudienceCard[] = [
  {
    id: 'students',
    title: 'Students & Early-Career Professionals',
    body:
      'Track how your thinking about careers, higher studies, opportunities, and skill priorities changes as you gain experience.',
    icon: GraduationCap,
  },
  {
    id: 'professionals',
    title: 'Working Professionals',
    body:
      'Revisit the reasoning behind role changes, negotiations, difficult trade-offs, and long-term career decisions with the original evidence still attached.',
    icon: Briefcase,
  },
  {
    id: 'founders',
    title: 'Founders & Builders',
    body:
      'Keep a governed record of why a product, project, or strategy decision was made so later pivots remain traceable.',
    icon: Rocket,
  },
  {
    id: 'leaders',
    title: 'Knowledge Workers & Leaders',
    body:
      'Reflect on hypotheses, positions, and judgment calls over time, with Gemini acting as a thinking companion rather than deciding what you believe.',
    icon: Brain,
  },
];

const PURPOSES = [
  {
    id: 'preserve',
    title: 'Preserve decision reasoning',
    body:
      'Return to the reasoning that existed when a decision was actually made instead of reconstructing it later from memory.',
    icon: History,
  },
  {
    id: 'compare',
    title: 'See how thinking evolves',
    body:
      'Approved Thought Snapshots can be compared across time through Thought Diffs to show what changed and what stayed consistent.',
    icon: GitCompare,
  },
  {
    id: 'govern',
    title: 'Keep AI memory under your control',
    body:
      'Gemini may suggest an interpretation, but you decide whether it becomes reusable memory and every comparison remains source-traceable.',
    icon: ShieldCheck,
  },
];

export default function TargetAudience() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="who-its-for"
      className="
        mirrortrace-unified-section
        mirrortrace-section-glass
        relative
        overflow-hidden
        px-4
        py-20
        text-white
        sm:px-6
        sm:py-24
        lg:px-8
      "
    >
      <div className="pointer-events-none absolute inset-0 bg-black/20" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-amber-300/20
              bg-black/35
              px-3
              py-1.5
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-amber-200
            "
          >
            <Sparkles className="h-3.5 w-3.5" />
            Built around your decisions
          </div>

          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Who MirrorTrace is for
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            MirrorTrace is built for people who make decisions, revisit ideas,
            and want to understand how their reasoning changes over time
            without letting AI silently decide what gets remembered.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.08,
              },
            },
          }}
          className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {AUDIENCES.map((audience) => {
            const Icon = audience.icon;

            return (
              <motion.article
                key={audience.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: reducedMotion ? 0 : 18,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                whileHover={reducedMotion ? undefined : { y: -4 }}
                className="
                  rounded-[26px]
                  border
                  border-white/10
                  bg-black/50
                  p-6
                  shadow-xl
                "
              >
                <div
                  className="
                    grid
                    h-11
                    w-11
                    place-items-center
                    rounded-2xl
                    border
                    border-amber-300/15
                    bg-amber-500/10
                    text-amber-200
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-serif text-lg font-bold text-white">
                  {audience.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  {audience.body}
                </p>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55 }}
          className="
            mt-14
            rounded-[30px]
            border
            border-white/10
            bg-black/50
            p-6
            sm:p-8
          "
        >
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
            What MirrorTrace is built for
          </div>

          <h3 className="mt-3 max-w-4xl font-serif text-2xl font-bold text-white sm:text-3xl">
            A journal that remembers with permission, compares with evidence,
            and stays traceable.
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            The goal is not to predict your personality or tell you what to
            think. MirrorTrace helps preserve, revisit, compare, and govern the
            reasoning you intentionally choose to keep.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PURPOSES.map((purpose) => {
              const Icon = purpose.icon;

              return (
                <article
                  key={purpose.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-200" />
                    <h4 className="text-sm font-bold text-white">
                      {purpose.title}
                    </h4>
                  </div>

                  <p className="mt-3 text-xs leading-6 text-white/55">
                    {purpose.body}
                  </p>
                </article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

