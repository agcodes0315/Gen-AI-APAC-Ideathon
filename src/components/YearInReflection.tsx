import React, {
  useMemo,
} from 'react';

import {
  BookOpen,
  CalendarDays,
  GitCompare,
  Sparkles,
  Tag,
} from 'lucide-react';

import type {
  JournalEntry,
  ThoughtDiff,
  ThoughtSnapshot,
} from '../types.ts';

interface YearInReflectionProps {
  entries: JournalEntry[];
  snapshots: ThoughtSnapshot[];
  diffs: ThoughtDiff[];
  year?: number;
}

type MonthCount = {
  month: number;
  count: number;
};

function getYear(
  value: string
): number | null {
  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date.getFullYear();
}

export const YearInReflection:
  React.FC<YearInReflectionProps> = ({
    entries,
    snapshots,
    diffs,
    year =
      new Date().getFullYear(),
  }) => {
    const summary =
      useMemo(
        () => {
          const yearEntries =
            entries.filter(
              (entry) =>
                getYear(
                  entry.createdAt
                ) === year
            );

          const yearSnapshots =
            snapshots.filter(
              (snapshot) =>
                getYear(
                  snapshot.createdAt
                ) === year
            );

          const yearDiffs =
            diffs.filter(
              (diff) =>
                getYear(
                  diff.createdAt
                ) === year
            );

          const monthCounts:
            MonthCount[] =
              Array.from(
                {
                  length: 12,
                },
                (
                  _,
                  month
                ) => ({
                  month,
                  count: 0,
                })
              );

          const tagCounts =
            new Map<
              string,
              number
            >();

          for (
            const entry of
            yearEntries
          ) {
            const date =
              new Date(
                entry.createdAt
              );

            if (
              !Number.isNaN(
                date.getTime()
              )
            ) {
              monthCounts[
                date.getMonth()
              ].count += 1;
            }

            for (
              const tag of
              entry.topicTags ||
              []
            ) {
              const normalized =
                tag
                  .trim()
                  .toLowerCase();

              if (!normalized) {
                continue;
              }

              tagCounts.set(
                normalized,
                (
                  tagCounts.get(
                    normalized
                  ) ||
                  0
                ) + 1
              );
            }
          }

          const activeMonth =
            [...monthCounts]
              .sort(
                (
                  left,
                  right
                ) =>
                  right.count -
                  left.count
              )[0];

          const topTopic =
            [...tagCounts.entries()]
              .sort(
                (
                  left,
                  right
                ) =>
                  right[1] -
                  left[1]
              )[0];

          return {
            reflections:
              yearEntries.length,

            snapshots:
              yearSnapshots.length,

            diffs:
              yearDiffs.length,

            activeMonth:
              activeMonth &&
              activeMonth.count >
                0
                ? new Intl.DateTimeFormat(
                    undefined,
                    {
                      month:
                        'long',
                    }
                  ).format(
                    new Date(
                      year,
                      activeMonth.month,
                      1
                    )
                  )
                : null,

            topTopic:
              topTopic
                ? topTopic[0]
                : null,
          };
        },
        [
          entries,
          snapshots,
          diffs,
          year,
        ]
      );

    const cards =
      [
        {
          label:
            'Reflections',
          value:
            summary.reflections,
          detail:
            'saved this year',
          icon:
            BookOpen,
        },
        {
          label:
            'Approved Snapshots',
          value:
            summary.snapshots,
          detail:
            'user-approved memories',
          icon:
            Sparkles,
        },
        {
          label:
            'Thought Diffs',
          value:
            summary.diffs,
          detail:
            'perspective comparisons',
          icon:
            GitCompare,
        },
      ];

    return (
      <section
        className="
          rounded-[30px]
          border
          border-white/10
          bg-black/45
          p-6
          text-white
          shadow-2xl
          sm:p-8
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-amber-300
              "
            >
              Year in Reflection
            </div>

            <h2
              className="
                mt-2
                font-serif
                text-2xl
                font-bold
                sm:text-3xl
              "
            >
              Your {year} reflection trail
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-stone-300
              "
            >
              A factual summary based only on
              reflections, approved memories and
              Thought Diffs you already created.
              No mood or psychological inference
              is performed.
            </p>
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-3
          "
        >
          {cards.map(
            (
              card
            ) => {
              const Icon =
                card.icon;

              return (
                <article
                  key={
                    card.label
                  }
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/35
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-stone-400
                      "
                    >
                      {card.label}
                    </span>

                    <Icon
                      className="
                        h-4
                        w-4
                        text-amber-300
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-3
                      text-3xl
                      font-bold
                    "
                  >
                    {card.value}
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-stone-400
                    "
                  >
                    {card.detail}
                  </p>
                </article>
              );
            }
          )}
        </div>

        <div
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <article
            className="
              rounded-2xl
              border
              border-white/10
              bg-black/30
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-stone-300
              "
            >
              <CalendarDays
                className="
                  h-4
                  w-4
                  text-amber-300
                "
              />
              Most active month
            </div>

            <p
              className="
                mt-3
                font-serif
                text-xl
                font-bold
              "
            >
              {summary.activeMonth ||
                'Not enough activity yet'}
            </p>
          </article>

          <article
            className="
              rounded-2xl
              border
              border-white/10
              bg-black/30
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-stone-300
              "
            >
              <Tag
                className="
                  h-4
                  w-4
                  text-amber-300
                "
              />
              Most revisited topic
            </div>

            <p
              className="
                mt-3
                font-serif
                text-xl
                font-bold
              "
            >
              {summary.topTopic
                ? `#${summary.topTopic}`
                : 'No repeated topic yet'}
            </p>
          </article>
        </div>
      </section>
    );
  };

export default YearInReflection;
