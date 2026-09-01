import React, {
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
} from 'lucide-react';

import type {
  JournalEntry,
} from '../types.ts';

interface JournalCalendarProps {
  entries: JournalEntry[];
}

function dateKey(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}

function safeDate(
  value: string
): Date | null {
  const parsed =
    new Date(value);

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

export const JournalCalendar:
  React.FC<JournalCalendarProps> = ({
    entries,
  }) => {
    const today =
      new Date();

    const [
      visibleMonth,
      setVisibleMonth,
    ] =
      useState(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
      );

    const [
      selectedDate,
      setSelectedDate,
    ] =
      useState<string | null>(
        null
      );

    const entriesByDate =
      useMemo(
        () => {
          const result =
            new Map<
              string,
              JournalEntry[]
            >();

          for (
            const entry of
            entries
          ) {
            const parsed =
              safeDate(
                entry.createdAt
              );

            if (!parsed) {
              continue;
            }

            const key =
              dateKey(
                parsed
              );

            const current =
              result.get(
                key
              ) ||
              [];

            current.push(
              entry
            );

            result.set(
              key,
              current
            );
          }

          return result;
        },
        [
          entries,
        ]
      );

    const days =
      useMemo(
        () => {
          const first =
            new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              1
            );

          const last =
            new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth() +
                1,
              0
            );

          const cells:
            Array<
              Date | null
            > =
              [];

          for (
            let index = 0;
            index <
            first.getDay();
            index += 1
          ) {
            cells.push(
              null
            );
          }

          for (
            let day = 1;
            day <=
            last.getDate();
            day += 1
          ) {
            cells.push(
              new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day
              )
            );
          }

          while (
            cells.length %
              7 !==
            0
          ) {
            cells.push(
              null
            );
          }

          return cells;
        },
        [
          visibleMonth,
        ]
      );

    const selectedEntries =
      selectedDate
        ? entriesByDate.get(
            selectedDate
          ) ||
          []
        : [];

    const moveMonth =
      (
        delta:
          number
      ) => {
        setVisibleMonth(
          (
            current
          ) =>
            new Date(
              current.getFullYear(),
              current.getMonth() +
                delta,
              1
            )
        );

        setSelectedDate(
          null
        );
      };

    return (
      <section
        className="
          rounded-[28px]
          border
          border-white/10
          bg-black/40
          p-4
          text-white
          shadow-2xl
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <div>
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
              Calendar / Timeline
            </div>

            <h3
              className="
                mt-1
                font-serif
                text-xl
                font-bold
              "
            >
              {new Intl.DateTimeFormat(
                undefined,
                {
                  month:
                    'long',
                  year:
                    'numeric',
                }
              ).format(
                visibleMonth
              )}
            </h3>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                moveMonth(
                  -1
                )
              }
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-xl
                border
                border-white/10
                bg-black/35
                text-stone-300
                hover:bg-white/10
                hover:text-white
              "
              aria-label="Previous month"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setVisibleMonth(
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  )
                );

                setSelectedDate(
                  null
                );
              }}
              className="
                rounded-xl
                border
                border-white/10
                bg-black/35
                px-3
                py-2
                text-xs
                font-semibold
                text-stone-300
                hover:bg-white/10
                hover:text-white
              "
            >
              Today
            </button>

            <button
              type="button"
              onClick={() =>
                moveMonth(
                  1
                )
              }
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-xl
                border
                border-white/10
                bg-black/35
                text-stone-300
                hover:bg-white/10
                hover:text-white
              "
              aria-label="Next month"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-7
            gap-1
            text-center
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-stone-500
          "
        >
          {[
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
          ].map(
            (
              day
            ) => (
              <div
                key={
                  day
                }
                className="
                  py-2
                "
              >
                {day}
              </div>
            )
          )}
        </div>

        <div
          className="
            grid
            grid-cols-7
            gap-1.5
          "
        >
          {days.map(
            (
              day,
              index
            ) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="
                      min-h-[72px]
                      rounded-xl
                    "
                  />
                );
              }

              const key =
                dateKey(
                  day
                );

              const dayEntries =
                entriesByDate.get(
                  key
                ) ||
                [];

              const selected =
                selectedDate ===
                key;

              const isToday =
                dateKey(
                  today
                ) ===
                key;

              return (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      selected
                        ? null
                        : key
                    )
                  }
                  className={`
                    relative
                    min-h-[72px]
                    rounded-xl
                    border
                    p-2
                    text-left
                    transition-colors
                    ${
                      selected
                        ? 'border-amber-300/50 bg-amber-400/10'
                        : 'border-white/10 bg-black/25 hover:bg-white/5'
                    }
                  `}
                >
                  <div
                    className={`
                      text-xs
                      font-semibold
                      ${
                        isToday
                          ? 'text-amber-300'
                          : 'text-stone-300'
                      }
                    `}
                  >
                    {day.getDate()}
                  </div>

                  {dayEntries.length >
                    0 && (
                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        gap-1
                        text-[10px]
                        font-semibold
                        text-amber-200
                      "
                    >
                      <BookOpen className="h-3 w-3" />

                      {dayEntries.length}
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>

        <div
          className="
            mt-5
            border-t
            border-white/10
            pt-5
          "
        >
          {!selectedDate ? (
            <p
              className="
                text-center
                text-xs
                text-stone-400
              "
            >
              Select a date to inspect reflections saved that day.
            </p>
          ) : selectedEntries.length ===
            0 ? (
            <p
              className="
                text-center
                text-xs
                text-stone-400
              "
            >
              No reflections were saved on this date.
            </p>
          ) : (
            <div className="space-y-3">
              <div
                className="
                  text-xs
                  font-semibold
                  text-stone-300
                "
              >
                {selectedEntries.length}{' '}
                {selectedEntries.length ===
                1
                  ? 'reflection'
                  : 'reflections'}{' '}
                on{' '}
                {new Intl.DateTimeFormat(
                  undefined,
                  {
                    dateStyle:
                      'medium',
                  }
                ).format(
                  new Date(
                    `${selectedDate}T12:00:00`
                  )
                )}
              </div>

              {selectedEntries.map(
                (
                  entry
                ) => (
                  <article
                    key={
                      entry.id
                    }
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      bg-black/30
                      p-4
                    "
                  >
                    <p
                      className="
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-stone-200
                      "
                    >
                      {entry.content}
                    </p>

                    {entry.topicTags &&
                      entry.topicTags.length >
                        0 && (
                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-1.5
                          "
                        >
                          {entry.topicTags.map(
                            (
                              tag
                            ) => (
                              <span
                                key={
                                  tag
                                }
                                className="
                                  rounded-full
                                  border
                                  border-amber-300/20
                                  bg-amber-400/10
                                  px-2
                                  py-1
                                  text-[10px]
                                  text-amber-200
                                "
                              >
                                #{tag}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

export default JournalCalendar;
