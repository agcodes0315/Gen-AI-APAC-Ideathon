import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import {
  createPortal,
} from 'react-dom';

interface AnchoredDatePickerProps {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

const CALENDAR_WIDTH = 350;
const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 4;
const ESTIMATED_HEIGHT = 445;

function toDateKey(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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

function parseDateKey(
  value: string
): Date | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split('-')
      .map(Number);

  const result =
    new Date(
      year,
      month - 1,
      day
    );

  return Number.isNaN(
    result.getTime()
  )
    ? null
    : result;
}

function formatValue(
  value: string
): string {
  const date =
    parseDateKey(
      value
    );

  if (!date) {
    return 'mm/dd/yyyy';
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month:
        '2-digit',
      day:
        '2-digit',
      year:
        'numeric',
    }
  ).format(
    date
  );
}

export const AnchoredDatePicker:
  React.FC<AnchoredDatePickerProps> = ({
    label,
    value,
    min,
    max,
    onChange,
  }) => {
    const triggerRef =
      useRef<HTMLButtonElement>(
        null
      );

    const popoverRef =
      useRef<HTMLDivElement>(
        null
      );

    const [
      open,
      setOpen,
    ] =
      useState(false);

    /*
     * IMPORTANT:
     * null means "not measured yet".
     * We never render the portal before a real position exists.
     * This removes the first-click top-left flash.
     */
    const [
      position,
      setPosition,
    ] =
      useState<PopoverPosition | null>(
        null
      );

    const initialDate =
      parseDateKey(
        value
      ) ||
      new Date();

    const [
      visibleMonth,
      setVisibleMonth,
    ] =
      useState(
        new Date(
          initialDate.getFullYear(),
          initialDate.getMonth(),
          1
        )
      );

    const measurePosition =
      (): PopoverPosition | null => {
        const trigger =
          triggerRef.current;

        if (!trigger) {
          return null;
        }

        const rect =
          trigger.getBoundingClientRect();

        const width =
          Math.min(
            CALENDAR_WIDTH,
            window.innerWidth -
              VIEWPORT_GAP *
                2
          );

        /*
         * Align the popup's RIGHT edge with the date field's RIGHT edge.
         * This visually anchors the calendar to the calendar-icon side.
         */
        let left =
          rect.right -
          width;

        left =
          Math.max(
            VIEWPORT_GAP,
            Math.min(
              left,
              window.innerWidth -
                width -
                VIEWPORT_GAP
            )
          );

        let top =
          rect.bottom +
          TRIGGER_GAP;

        /*
         * Prefer directly below.
         * Only flip above when there genuinely isn't enough viewport room.
         */
        if (
          top +
            ESTIMATED_HEIGHT >
          window.innerHeight -
            VIEWPORT_GAP
        ) {
          const above =
            rect.top -
            ESTIMATED_HEIGHT -
            TRIGGER_GAP;

          if (
            above >=
            VIEWPORT_GAP
          ) {
            top =
              above;
          }
        }

        return {
          top,
          left,
          width,
        };
      };

    const openCalendar =
      () => {
        if (open) {
          setOpen(
            false
          );

          setPosition(
            null
          );

          return;
        }

        /*
         * Measure synchronously BEFORE rendering the portal.
         * This is the key no-flash fix.
         */
        const next =
          measurePosition();

        if (!next) {
          return;
        }

        setPosition(
          next
        );

        setOpen(
          true
        );
      };

    useEffect(() => {
      const selected =
        parseDateKey(
          value
        );

      if (selected) {
        setVisibleMonth(
          new Date(
            selected.getFullYear(),
            selected.getMonth(),
            1
          )
        );
      }
    }, [
      value,
    ]);

    useEffect(() => {
      if (!open) {
        return;
      }

      const handlePointer =
        (
          event:
            MouseEvent
        ) => {
          const target =
            event.target as Node;

          const insideTrigger =
            triggerRef.current
              ?.contains(
                target
              );

          const insidePopover =
            popoverRef.current
              ?.contains(
                target
              );

          if (
            !insideTrigger &&
            !insidePopover
          ) {
            setOpen(
              false
            );

            setPosition(
              null
            );
          }
        };

      const handleKey =
        (
          event:
            KeyboardEvent
        ) => {
          if (
            event.key ===
            'Escape'
          ) {
            setOpen(
              false
            );

            setPosition(
              null
            );
          }
        };

      const reposition =
        () => {
          const next =
            measurePosition();

          if (next) {
            setPosition(
              next
            );
          }
        };

      document.addEventListener(
        'mousedown',
        handlePointer
      );

      document.addEventListener(
        'keydown',
        handleKey
      );

      window.addEventListener(
        'resize',
        reposition
      );

      window.addEventListener(
        'scroll',
        reposition,
        true
      );

      return () => {
        document.removeEventListener(
          'mousedown',
          handlePointer
        );

        document.removeEventListener(
          'keydown',
          handleKey
        );

        window.removeEventListener(
          'resize',
          reposition
        );

        window.removeEventListener(
          'scroll',
          reposition,
          true
        );
      };
    }, [
      open,
    ]);

    const days =
      useMemo(
        () => {
          const firstDay =
            new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              1
            );

          const lastDay =
            new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth() +
                1,
              0
            );

          const result:
            Array<
              Date | null
            > =
              [];

          for (
            let index = 0;
            index <
            firstDay.getDay();
            index += 1
          ) {
            result.push(
              null
            );
          }

          for (
            let day = 1;
            day <=
            lastDay.getDate();
            day += 1
          ) {
            result.push(
              new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day
              )
            );
          }

          while (
            result.length %
              7 !==
            0
          ) {
            result.push(
              null
            );
          }

          return result;
        },
        [
          visibleMonth,
        ]
      );

    const isDisabled =
      (
        day:
          Date
      ) => {
        const key =
          toDateKey(
            day
          );

        return (
          (
            min &&
            key < min
          ) ||
          (
            max &&
            key > max
          )
        );
      };

    const selectDate =
      (
        day:
          Date
      ) => {
        if (
          isDisabled(
            day
          )
        ) {
          return;
        }

        onChange(
          toDateKey(
            day
          )
        );

        setOpen(
          false
        );

        setPosition(
          null
        );
      };

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
      };

    const calendar =
      open &&
      position &&
      typeof document !==
        'undefined'
        ? createPortal(
            <div
              ref={
                popoverRef
              }
              role="dialog"
              aria-label={`${label} calendar`}
              style={{
                position:
                  'fixed',
                top:
                  position.top,
                left:
                  position.left,
                width:
                  position.width,
              }}
              className="
                z-[99999]
                rounded-2xl
                border
                border-stone-700
                bg-black
                p-4
                text-white
                shadow-[0_20px_60px_rgba(0,0,0,0.55)]
              "
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    moveMonth(
                      -1
                    )
                  }
                  className="
                    grid
                    h-11
                    w-11
                    place-items-center
                    rounded-xl
                    border
                    border-stone-700
                    bg-stone-950
                    text-stone-200
                    hover:bg-stone-900
                  "
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="text-sm font-semibold text-white">
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
                </div>

                <button
                  type="button"
                  onClick={() =>
                    moveMonth(
                      1
                    )
                  }
                  className="
                    grid
                    h-11
                    w-11
                    place-items-center
                    rounded-xl
                    border
                    border-stone-700
                    bg-stone-950
                    text-stone-200
                    hover:bg-stone-900
                  "
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-7
                  gap-2
                  text-center
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-stone-500
                "
              >
                {[
                  'Su',
                  'Mo',
                  'Tu',
                  'We',
                  'Th',
                  'Fr',
                  'Sa',
                ].map(
                  (
                    day
                  ) => (
                    <div
                      key={
                        day
                      }
                      className="py-1"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {days.map(
                  (
                    day,
                    index
                  ) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-10"
                        />
                      );
                    }

                    const key =
                      toDateKey(
                        day
                      );

                    const selected =
                      key ===
                      value;

                    const today =
                      key ===
                      toDateKey(
                        new Date()
                      );

                    const disabled =
                      isDisabled(
                        day
                      );

                    return (
                      <button
                        key={
                          key
                        }
                        type="button"
                        onClick={() =>
                          selectDate(
                            day
                          )
                        }
                        disabled={
                          disabled
                        }
                        className={`
                          grid
                          h-10
                          place-items-center
                          rounded-xl
                          border
                          text-sm
                          transition-colors
                          ${
                            selected
                              ? 'border-amber-400 bg-amber-400 text-black font-bold'
                              : today
                                ? 'border-amber-300/60 bg-stone-950 text-amber-300'
                                : 'border-stone-800 bg-stone-950 text-stone-200 hover:bg-stone-900'
                          }
                          ${
                            disabled
                              ? 'cursor-not-allowed opacity-25'
                              : ''
                          }
                        `}
                      >
                        {day.getDate()}
                      </button>
                    );
                  }
                )}
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  border-t
                  border-stone-800
                  pt-3
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(
                      ''
                    );

                    setOpen(
                      false
                    );

                    setPosition(
                      null
                    );
                  }}
                  disabled={
                    !value
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    text-stone-400
                    hover:text-white
                    disabled:opacity-30
                  "
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const today =
                      new Date();

                    if (
                      !isDisabled(
                        today
                      )
                    ) {
                      onChange(
                        toDateKey(
                          today
                        )
                      );

                      setVisibleMonth(
                        new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          1
                        )
                      );

                      setOpen(
                        false
                      );

                      setPosition(
                        null
                      );
                    }
                  }}
                  className="
                    text-xs
                    font-semibold
                    text-amber-300
                    hover:text-amber-200
                  "
                >
                  Today
                </button>
              </div>
            </div>,
            document.body
          )
        : null;

    return (
      <>
        <button
          ref={
            triggerRef
          }
          type="button"
          onClick={
            openCalendar
          }
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/35
            px-3
            py-2
            text-left
            transition-colors
            hover:border-white/20
          "
          aria-haspopup="dialog"
          aria-expanded={
            open
          }
        >
          <span
            className="
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-stone-400
            "
          >
            {label}
          </span>

          <span
            className="
              mt-1
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span
              className={
                value
                  ? 'text-xs text-white'
                  : 'text-xs text-stone-400'
              }
            >
              {formatValue(
                value
              )}
            </span>

            <CalendarDays className="h-4 w-4 shrink-0 text-stone-300" />
          </span>
        </button>

        {calendar}
      </>
    );
  };

export default AnchoredDatePicker;

