import React from 'react';

import {
  CalendarDays,
  Search,
  Tag,
  X,
} from 'lucide-react';

export interface JournalHistoryFilterState {
  query: string;
  tag: string | null;
  startDate: string;
  endDate: string;
}

interface JournalHistoryFiltersProps {
  value: JournalHistoryFilterState;
  availableTags: string[];
  totalCount: number;
  filteredCount: number;
  onChange: (next: JournalHistoryFilterState) => void;
}

function normalizeDateInput(
  value: string
): string {
  return value.trim();
}

export const JournalHistoryFilters:
  React.FC<JournalHistoryFiltersProps> = ({
    value,
    availableTags,
    totalCount,
    filteredCount,
    onChange,
  }) => {
    const setQuery = (
      query: string
    ) => {
      onChange({
        ...value,
        query,
      });
    };

    const setTag = (
      tag: string | null
    ) => {
      onChange({
        ...value,
        tag,
      });
    };

    const setStartDate = (
      startDate: string
    ) => {
      onChange({
        ...value,
        startDate:
          normalizeDateInput(
            startDate
          ),
      });
    };

    const setEndDate = (
      endDate: string
    ) => {
      onChange({
        ...value,
        endDate:
          normalizeDateInput(
            endDate
          ),
      });
    };

    const clearFilters =
      () => {
        onChange({
          query: '',
          tag: null,
          startDate: '',
          endDate: '',
        });
      };

    const hasFilters =
      Boolean(
        value.query ||
        value.tag ||
        value.startDate ||
        value.endDate
      );

    return (
      <section
        className="
          rounded-2xl
          border
          border-white/10
          bg-black/40
          p-4
          shadow-lg
        "
        aria-label="Journal history filters"
      >
        <div
          className="
            flex
            flex-col
            gap-4
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
            "
          >
            <div
              className="
                relative
                min-w-0
                flex-1
              "
            >
              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-stone-400
                "
              />

              <input
                type="search"
                value={value.query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search reflections or tags..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-black/35
                  py-2.5
                  pl-10
                  pr-10
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-stone-500
                  focus:border-amber-300/40
                "
              />

              {value.query && (
                <button
                  type="button"
                  onClick={() =>
                    setQuery('')
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-stone-500
                    hover:text-white
                  "
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <label
              className="
                flex
                min-w-[180px]
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-black/35
                px-3
              "
            >
              <Tag className="h-4 w-4 text-amber-300" />

              <select
                value={
                  value.tag ?? ''
                }
                onChange={(
                  event
                ) =>
                  setTag(
                    event.target.value ||
                      null
                  )
                }
                className="
                  w-full
                  bg-transparent
                  py-2.5
                  text-sm
                  text-white
                  outline-none
                "
              >
                <option
                  value=""
                  className="bg-stone-950"
                >
                  All topics
                </option>

                {availableTags.map(
                  (tag) => (
                    <option
                      key={tag}
                      value={tag}
                      className="bg-stone-950"
                    >
                      #{tag}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-[1fr_1fr_auto]
            "
          >
            <label
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-black/35
                px-3
              "
            >
              <CalendarDays
                className="
                  h-4
                  w-4
                  text-stone-400
                "
              />

              <div className="min-w-0 flex-1">
                <span
                  className="
                    block
                    pt-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-stone-500
                  "
                >
                  From
                </span>

                <input
                  type="date"
                  value={
                    value.startDate
                  }
                  max={
                    value.endDate ||
                    undefined
                  }
                  onChange={(
                    event
                  ) =>
                    setStartDate(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    bg-transparent
                    pb-2
                    text-sm
                    text-white
                    outline-none
                  "
                />
              </div>
            </label>

            <label
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-black/35
                px-3
              "
            >
              <CalendarDays
                className="
                  h-4
                  w-4
                  text-stone-400
                "
              />

              <div className="min-w-0 flex-1">
                <span
                  className="
                    block
                    pt-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-stone-500
                  "
                >
                  To
                </span>

                <input
                  type="date"
                  value={
                    value.endDate
                  }
                  min={
                    value.startDate ||
                    undefined
                  }
                  onChange={(
                    event
                  ) =>
                    setEndDate(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    bg-transparent
                    pb-2
                    text-sm
                    text-white
                    outline-none
                  "
                />
              </div>
            </label>

            <button
              type="button"
              onClick={
                clearFilters
              }
              disabled={!hasFilters}
              className="
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2.5
                text-xs
                font-semibold
                text-stone-300
                transition-colors
                hover:bg-white/10
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Clear filters
            </button>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
              border-t
              border-white/10
              pt-3
              text-[11px]
              text-stone-400
            "
          >
            <span>
              Showing{' '}
              <strong className="text-white">
                {filteredCount}
              </strong>{' '}
              of{' '}
              <strong className="text-white">
                {totalCount}
              </strong>{' '}
              reflections
            </span>

            <span>
              Keyword, topic and date filtering
              uses your already-loaded owner-scoped
              journal data. No AI call is made.
            </span>
          </div>
        </div>
      </section>
    );
  };

export function journalEntryMatchesFilters(
  entry: {
    content: string;
    topicTags?: string[];
    createdAt: string;
  },
  filters: JournalHistoryFilterState
): boolean {
  const query =
    filters.query
      .trim()
      .toLowerCase();

  const tags =
    Array.isArray(
      entry.topicTags
    )
      ? entry.topicTags
      : [];

  const matchesQuery =
    !query ||
    entry.content
      .toLowerCase()
      .includes(query) ||
    tags.some(
      (tag) =>
        tag
          .toLowerCase()
          .includes(query)
    );

  const matchesTag =
    !filters.tag ||
    tags.includes(
      filters.tag
    );

  const created =
    new Date(
      entry.createdAt
    );

  if (
    Number.isNaN(
      created.getTime()
    )
  ) {
    return (
      matchesQuery &&
      matchesTag
    );
  }

  let matchesStart =
    true;

  if (
    filters.startDate
  ) {
    const start =
      new Date(
        `${filters.startDate}T00:00:00`
      );

    matchesStart =
      created >= start;
  }

  let matchesEnd =
    true;

  if (
    filters.endDate
  ) {
    const end =
      new Date(
        `${filters.endDate}T23:59:59.999`
      );

    matchesEnd =
      created <= end;
  }

  return (
    matchesQuery &&
    matchesTag &&
    matchesStart &&
    matchesEnd
  );
}

export default JournalHistoryFilters;
