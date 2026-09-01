import React from 'react';

import {
  Brain,
  Briefcase,
  GraduationCap,
  Rocket,
} from 'lucide-react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

type Audience = {
  id: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  body: string;
};

const AUDIENCES: Audience[] = [
  {
    id: 'students',
    icon: GraduationCap,
    title: 'Students & Early-Career Professionals',
    body:
      'Track how your thinking on career direction, offers, higher studies, and skill priorities shifts as you learn more about what you actually want.',
  },
  {
    id: 'professionals',
    icon: Briefcase,
    title: 'Working Professionals',
    body:
      'Revisit the reasoning behind a role change, a negotiation stance, a leadership decision, or a hard tradeoff — with the evidence still attached to it.',
  },
  {
    id: 'founders',
    icon: Rocket,
    title: 'Founders & Builders',
    body:
      'Keep a governed record of why a product or strategy decision was made, so pivots are traceable instead of simply remembered differently later.',
  },
  {
    id: 'knowledge-workers',
    icon: Brain,
    title: 'Knowledge Workers & Leaders',
    body:
      'Reflect on hypotheses, positions, priorities, and judgment calls over time, with Gemini as a thinking partner — never the one deciding what you believe.',
  },
];

export const TargetAudience: React.FC = () => {
  const reducedMotion =
    useReducedMotion();

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
      <div className="relative z-10 mx-auto max-w-7xl">

        <motion.div
          initial={{
            opacity: 0,
            y: reducedMotion
              ? 0
              : 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.55,
          }}
          className="text-center"
        >
          <div
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.22em]
              text-amber-300
            "
          >
            One product, built for how you think
          </div>

          <h2
            className="
              mt-3
              font-serif
              text-4xl
              font-bold
              tracking-tight
              text-white
              sm:text-5xl
            "
          >
            Who MirrorTrace is for.
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-white/65
            "
          >
            MirrorTrace is not a separate app for each audience.
            It is one evidence-first reflection system for people
            whose decisions, beliefs, and priorities evolve over time.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren:
                  reducedMotion
                    ? 0
                    : 0.09,
              },
            },
          }}
          className="
            mt-12
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          {AUDIENCES.map(
            (
              audience
            ) => {
              const Icon =
                audience.icon;

              return (
                <motion.article
                  key={
                    audience.id
                  }
                  variants={{
                    hidden: {
                      opacity: 0,
                      y:
                        reducedMotion
                          ? 0
                          : 18,
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  whileHover={
                    reducedMotion
                      ? undefined
                      : {
                          y: -4,
                        }
                  }
                  className="
                    rounded-[26px]
                    border
                    border-white/10
                    bg-black/40
                    p-6
                    shadow-2xl
                    transition-colors
                    hover:border-amber-300/25
                    hover:bg-black/48
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
                      border-amber-300/20
                      bg-amber-300/10
                      text-amber-200
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3
                    className="
                      mt-4
                      font-serif
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    {audience.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-white/60
                    "
                  >
                    {audience.body}
                  </p>
                </motion.article>
              );
            }
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TargetAudience;
