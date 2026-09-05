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

import '../styles/mirrortrace-year-provenance-fix.css';

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

function getValidDate(
  ...values: Array<
    string | null | undefined
  >
): Date | null {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }
  }

  return null;
}

function dateIsInYear(
  date: Date | null,
  year: number
): boolean {
  return Boolean(
    date &&
      date.getFullYear() ===
        year
  );
}

function normalizeTopic(
  value?: string | null
): string {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
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
          /*
           * Build source maps first.
           *
           * Year in Reflection should not depend only on
           * the timestamp attached to the derived object.
           *
           * A Thought Snapshot belongs to a source journal.
           * A Thought Diff belongs to earlier/later snapshots
           * and journals.
           *
           * This lets the yearly summary remain accurate even
           * if one returned derived object has an older/missing
           * createdAt field.
           */

          const entryById =
            new Map<
              string,
              JournalEntry
            >();

          for (
            const entry of entries
          ) {
            entryById.set(
              entry.id,
              entry
            );
          }

          const snapshotById =
            new Map<
              string,
              ThoughtSnapshot
            >();

          for (
            const snapshot of
              snapshots
          ) {
            snapshotById.set(
              snapshot.id,
              snapshot
            );
          }

          /*
           * Reflections
           */

          const yearEntries =
            entries.filter(
              (entry) =>
                dateIsInYear(
                  getValidDate(
                    entry.createdAt,
                    entry.updatedAt
                  ),
                  year
                )
            );

          /*
           * Approved snapshots
           *
           * Primary:
           *   approvedAt
           *
           * Fallback:
           *   createdAt
           *
           * Final relationship fallback:
           *   source journal belongs to selected year
           */

          const yearSnapshots =
            snapshots.filter(
              (snapshot) => {
                const snapshotDate =
                  getValidDate(
                    snapshot.approvedAt,
                    snapshot.createdAt
                  );

                if (
                  dateIsInYear(
                    snapshotDate,
                    year
                  )
                ) {
                  return true;
                }

                const sourceEntry =
                  entryById.get(
                    snapshot.sourceJournalId
                  );

                if (
                  !sourceEntry
                ) {
                  return false;
                }

                return dateIsInYear(
                  getValidDate(
                    sourceEntry.createdAt,
                    sourceEntry.updatedAt
                  ),
                  year
                );
              }
            );

          /*
           * Thought Diffs
           *
           * Primary:
           *   diff.createdAt
           *
           * Relationship fallback:
           *   later approved snapshot date
           *   later source journal date
           *
           * This is important because Year in Reflection is
           * summarizing the user's yearly reflective record,
           * not merely trusting one presentation timestamp.
           */

          const yearDiffs =
            diffs.filter(
              (diff) => {
                if (
                  dateIsInYear(
                    getValidDate(
                      diff.createdAt
                    ),
                    year
                  )
                ) {
                  return true;
                }

                const laterSnapshot =
                  snapshotById.get(
                    diff.laterSnapshotId
                  );

                if (
                  laterSnapshot &&
                  dateIsInYear(
                    getValidDate(
                      laterSnapshot.approvedAt,
                      laterSnapshot.createdAt
                    ),
                    year
                  )
                ) {
                  return true;
                }

                const laterEntry =
                  entryById.get(
                    diff.laterJournalId
                  );

                if (
                  laterEntry &&
                  dateIsInYear(
                    getValidDate(
                      laterEntry.createdAt,
                      laterEntry.updatedAt
                    ),
                    year
                  )
                ) {
                  return true;
                }

                return false;
              }
            );

          /*
           * Most active month
           */

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

          for (
            const entry of
              yearEntries
          ) {
            const date =
              getValidDate(
                entry.createdAt,
                entry.updatedAt
              );

            if (!date) {
              continue;
            }

            monthCounts[
              date.getMonth()
            ].count += 1;
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

          /*
           * Most revisited topic
           *
           * Previously this looked only at raw journal tags.
           * That meant a genuinely repeated subject could still
           * display "No repeated topic yet".
           *
           * We now count factual topic signals already present in:
           * - journal tags
           * - approved snapshot topics
           * - Thought Diff topics
           *
           * No psychological inference is performed.
           */

          const topicCounts =
            new Map<
              string,
              number
            >();

          const addTopic =
            (
              value?:
                string | null
            ) => {
              const normalized =
                normalizeTopic(
                  value
                );

              if (!normalized) {
                return;
              }

              topicCounts.set(
                normalized,
                (
                  topicCounts.get(
                    normalized
                  ) || 0
                ) + 1
              );
            };

          for (
            const entry of
              yearEntries
          ) {
            for (
              const tag of
                entry.topicTags ||
                []
            ) {
              addTopic(tag);
            }
          }

          for (
            const snapshot of
              yearSnapshots
          ) {
            addTopic(
              snapshot.topic
            );
          }

          for (
            const diff of
              yearDiffs
          ) {
            addTopic(
              diff.topic
            );
          }

          const sortedTopics =
            [
              ...topicCounts.entries(),
            ].sort(
              (
                left,
                right
              ) =>
                right[1] -
                left[1]
            );

          const repeatedTopic =
            sortedTopics.find(
              (
                [
                  _topic,
                  count,
                ]
              ) =>
                count >= 2
            );

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
              repeatedTopic
                ? repeatedTopic[0]
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
          mirrortrace-year-reflection
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