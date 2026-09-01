import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BellRing,
  Brain,
  CalendarClock,
  Download,
  GitBranch,
  History,
  Link2,
  ListChecks,
  Pencil,
  Pin,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

import type { JournalEntry } from '../types.ts';

import {
  JournalEnhancementError,
  createAssumption,
  createChain,
  createDecision,
  createRevisitBookmark,
  deleteRevisitBookmark,
  downloadJournalEnhancementExport,
  editJournalEntry,
  favoriteJournal,
  fetchAssumptions,
  fetchChains,
  fetchDailyReminder,
  fetchDecisions,
  fetchFavorites,
  fetchJournalVersions,
  fetchKnowledgeGraph,
  fetchRevisitBookmarks,
  fetchWeeklyReview,
  saveDailyReminder,
  unfavoriteJournal,
  updateAssumption,
  type AssumptionItem,
  type DailyReminderPreference,
  type DecisionLedgerItem,
  type Favorite,
  type JournalVersion,
  type KnowledgeGraph,
  type ReflectionChain,
  type RevisitBookmark,
  type WeeklyReview,
} from '../lib/journalEnhancements.ts';

interface JournalEnhancementsHubProps {
  entries: JournalEntry[];
  onChanged?: () => void;
}

type Section =
  | 'reminders'
  | 'favorites'
  | 'edit'
  | 'revisit'
  | 'weekly'
  | 'decisions'
  | 'chains'
  | 'assumptions'
  | 'versions'
  | 'graph';

const DEFAULT_REMINDER: DailyReminderPreference = {
  enabled: false,
  timezone:
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone || 'UTC',
  hour: 19,
  pushEnabled: true,
  emailEnabled: false,
};

export default function JournalEnhancementsHub(
  props: JournalEnhancementsHubProps
) {
  const [open, setOpen] =
    useState<Section | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [revisit, setRevisit] =
    useState<RevisitBookmark[]>([]);

  const [reminder, setReminder] =
    useState<DailyReminderPreference>(
      DEFAULT_REMINDER
    );

  const [decisions, setDecisions] =
    useState<DecisionLedgerItem[]>([]);

  const [chains, setChains] =
    useState<ReflectionChain[]>([]);

  const [assumptions, setAssumptions] =
    useState<AssumptionItem[]>([]);

  const [weekly, setWeekly] =
    useState<WeeklyReview | null>(null);

  const [graph, setGraph] =
    useState<KnowledgeGraph | null>(null);

  const [selectedJournalId, setSelectedJournalId] =
    useState(
      props.entries[0]?.id || ''
    );

  const [editContent, setEditContent] =
    useState('');

  const [editTags, setEditTags] =
    useState('');

  const [versions, setVersions] =
    useState<JournalVersion[]>([]);

  const [revisitAt, setRevisitAt] =
    useState('');

  const [decisionTitle, setDecisionTitle] =
    useState('');

  const [decisionText, setDecisionText] =
    useState('');

  const [
    decisionReasoning,
    setDecisionReasoning,
  ] =
    useState('');

  const [chainTitle, setChainTitle] =
    useState('');

  const [
    chainSelection,
    setChainSelection,
  ] =
    useState<string[]>([]);

  const [
    assumptionText,
    setAssumptionText,
  ] =
    useState('');

  const selectedJournal =
    useMemo(
      () =>
        props.entries.find(
          (entry) =>
            entry.id === selectedJournalId
        ) || null,
      [
        props.entries,
        selectedJournalId,
      ]
    );

  useEffect(() => {
    if (
      !selectedJournal &&
      props.entries[0]
    ) {
      setSelectedJournalId(
        props.entries[0].id
      );
    }
  }, [
    props.entries,
    selectedJournal,
  ]);

  useEffect(() => {
    if (!selectedJournal) {
      setEditContent('');
      setEditTags('');
      return;
    }

    setEditContent(
      selectedJournal.content
    );

    setEditTags(
      (
        selectedJournal.topicTags ||
        []
      ).join(', ')
    );
  }, [selectedJournal]);

  const load =
    useCallback(
      async () => {
        const [
          nextFavorites,
          nextRevisit,
          nextReminder,
          nextDecisions,
          nextChains,
          nextAssumptions,
        ] =
          await Promise.all([
            fetchFavorites().catch(
              () => []
            ),
            fetchRevisitBookmarks().catch(
              () => []
            ),
            fetchDailyReminder().catch(
              () =>
                DEFAULT_REMINDER
            ),
            fetchDecisions().catch(
              () => []
            ),
            fetchChains().catch(
              () => []
            ),
            fetchAssumptions().catch(
              () => []
            ),
          ]);

        setFavorites(
          nextFavorites
        );
        setRevisit(
          nextRevisit
        );
        setReminder(
          nextReminder
        );
        setDecisions(
          nextDecisions
        );
        setChains(
          nextChains
        );
        setAssumptions(
          nextAssumptions
        );
      },
      []
    );

  useEffect(() => {
    void load();
  }, [load]);

  const run =
    async (
      action: () => Promise<void>
    ) => {
      setBusy(true);
      setError(null);
      setMessage(null);

      try {
        await action();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Operation failed.'
        );
      } finally {
        setBusy(false);
      }
    };

  const favoriteIds =
    new Set(
      favorites.map(
        (item) =>
          item.journalId
      )
    );

  const sections: Array<{
    id: Section;
    label: string;
    icon:
      React.ComponentType<{
        className?: string;
      }>;
  }> = [
    {
      id: 'reminders',
      label: 'Daily Reminder',
      icon: BellRing,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Pin,
    },
    {
      id: 'edit',
      label: 'Edit Entry',
      icon: Pencil,
    },
    {
      id: 'revisit',
      label: 'Revisit This',
      icon: CalendarClock,
    },
    {
      id: 'weekly',
      label: 'Weekly Review',
      icon: Sparkles,
    },
    {
      id: 'decisions',
      label: 'Decision Ledger',
      icon: ListChecks,
    },
    {
      id: 'chains',
      label: 'Reflection Chains',
      icon: Link2,
    },
    {
      id: 'assumptions',
      label: 'Assumptions',
      icon: Brain,
    },
    {
      id: 'versions',
      label: 'Version History',
      icon: History,
    },
    {
      id: 'graph',
      label: 'Knowledge Graph',
      icon: GitBranch,
    },
  ];

  const selector =
    (open === 'edit' ||
      open === 'revisit' ||
      open === 'versions' ||
      open === 'decisions' ||
      open === 'assumptions') ? (
      <label className="mb-4 block text-xs text-white/60">
        <span className="mb-1 block">
          Reflection
        </span>

        <select
          value={selectedJournalId}
          onChange={(event) => {
            setSelectedJournalId(
              event.target.value
            );
            setVersions([]);
          }}
          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
        >
          {props.entries.map(
            (entry) => (
              <option
                key={entry.id}
                value={entry.id}
              >
                {entry.content.slice(
                  0,
                  90
                )}
              </option>
            )
          )}
        </select>
      </label>
    ) : null;

  return (
    <section className="rounded-[26px] border border-white/10 bg-black/45 p-5 text-white shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
            Journal tools
          </div>

          <h2 className="mt-1 font-serif text-xl font-bold">
            Reflection Workspace
          </h2>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/55">
            Owner-isolated journal utilities. These tools use your existing Firestore data and do not require new Gemini calls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void run(
                async () => {
                  await downloadJournalEnhancementExport();
                  setMessage(
                    'Export downloaded.'
                  );
                }
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/40"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {sections.map(
          (section) => {
            const Icon =
              section.icon;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setOpen(
                    (current) =>
                      current === section.id
                        ? null
                        : section.id
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                  open === section.id
                    ? 'border-amber-300/30 bg-amber-500/15 text-amber-100'
                    : 'border-white/10 bg-black/30 text-white/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {section.label}
              </button>
            );
          }
        )}
      </div>

      {(error || message) && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            error
              ? 'border-red-400/20 bg-red-500/10 text-red-200'
              : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          {error || message}
        </div>
      )}

      {open && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <strong className="text-sm">
              {
                sections.find(
                  (section) =>
                    section.id === open
                )?.label
              }
            </strong>

            <button
              type="button"
              onClick={() =>
                setOpen(null)
              }
              className="text-white/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selector}

          {open === 'reminders' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs text-white/70">
                <span className="mb-1 block">
                  Reminder hour
                </span>

                <select
                  value={reminder.hour}
                  onChange={(event) =>
                    setReminder(
                      (current) => ({
                        ...current,
                        hour:
                          Number(
                            event.target.value
                          ),
                      })
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
                >
                  {Array.from(
                    {
                      length: 24,
                    },
                    (
                      _,
                      hour
                    ) => (
                      <option
                        key={hour}
                        value={hour}
                      >
                        {String(hour).padStart(
                          2,
                          '0'
                        )}
                        :00
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="text-xs text-white/70">
                <span className="mb-1 block">
                  Timezone
                </span>

                <input
                  value={reminder.timezone}
                  onChange={(event) =>
                    setReminder(
                      (current) => ({
                        ...current,
                        timezone:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
                />
              </label>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={(event) =>
                    setReminder(
                      (current) => ({
                        ...current,
                        enabled:
                          event.target.checked,
                      })
                    )
                  }
                />
                Enable daily “You haven’t reflected today” reminder
              </label>

              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reminder.pushEnabled}
                    onChange={(event) =>
                      setReminder(
                        (current) => ({
                          ...current,
                          pushEnabled:
                            event.target.checked,
                        })
                      )
                    }
                  />
                  Push
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reminder.emailEnabled}
                    onChange={(event) =>
                      setReminder(
                        (current) => ({
                          ...current,
                          emailEnabled:
                            event.target.checked,
                        })
                      )
                    }
                  />
                  Email
                </label>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    async () => {
                      const result =
                        await saveDailyReminder(
                          reminder
                        );
                      setReminder(
                        result.preference
                      );
                      setMessage(
                        'Daily reminder preferences saved.'
                      );
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50 md:col-span-2"
              >
                Save reminder settings
              </button>
            </div>
          )}

          {open === 'favorites' && (
            <div className="space-y-2">
              {props.entries.map(
                (entry) => {
                  const active =
                    favoriteIds.has(
                      entry.id
                    );

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          async () => {
                            if (active) {
                              await unfavoriteJournal(
                                entry.id
                              );
                            } else {
                              await favoriteJournal(
                                entry.id
                              );
                            }

                            await load();
                          }
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-left"
                    >
                      <span className="line-clamp-1 text-xs text-white/75">
                        {entry.content}
                      </span>

                      <Pin
                        className={`h-4 w-4 ${
                          active
                            ? 'fill-amber-300 text-amber-300'
                            : 'text-white/35'
                        }`}
                      />
                    </button>
                  );
                }
              )}
            </div>
          )}

          {open === 'edit' &&
            selectedJournal && (
              <div className="space-y-3">
                <textarea
                  rows={7}
                  value={editContent}
                  onChange={(event) =>
                    setEditContent(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-white"
                />

                <input
                  value={editTags}
                  onChange={(event) =>
                    setEditTags(
                      event.target.value
                    )
                  }
                  placeholder="tags, comma, separated"
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-xs text-white"
                />

                <button
                  type="button"
                  disabled={
                    busy ||
                    !editContent.trim()
                  }
                  onClick={() =>
                    void run(
                      async () => {
                        const payload = {
                          content:
                            editContent,
                          topicTags:
                            editTags
                              .split(',')
                              .map(
                                (tag) =>
                                  tag.trim()
                              )
                              .filter(Boolean),
                        };

                        try {
                          await editJournalEntry(
                            selectedJournal.id,
                            payload
                          );
                        } catch (caught) {
                          if (
                            caught instanceof
                              JournalEnhancementError &&
                            caught.status === 409 &&
                            caught.code ===
                              'DERIVED_MEMORY_EXISTS'
                          ) {
                            const confirmed =
                              window.confirm(
                                'This reflection has approved AI memory derived from it. Editing will invalidate the linked Thought Snapshot, Thought Diffs, provenance and watches. Continue?'
                              );

                            if (!confirmed) {
                              return;
                            }

                            await editJournalEntry(
                              selectedJournal.id,
                              {
                                ...payload,
                                confirmInvalidateDerived:
                                  true,
                              }
                            );
                          } else {
                            throw caught;
                          }
                        }

                        setMessage(
                          'Reflection updated. The previous version was preserved.'
                        );

                        props.onChanged?.();
                      }
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save edit
                </button>
              </div>
            )}

          {open === 'revisit' && (
            <div className="space-y-3">
              <input
                type="datetime-local"
                value={revisitAt}
                onChange={(event) =>
                  setRevisitAt(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
              />

              <button
                type="button"
                disabled={
                  busy ||
                  !selectedJournalId ||
                  !revisitAt
                }
                onClick={() =>
                  void run(
                    async () => {
                      await createRevisitBookmark({
                        journalId:
                          selectedJournalId,
                        revisitAt:
                          new Date(
                            revisitAt
                          ).toISOString(),
                        pushEnabled: true,
                        emailEnabled: false,
                      });

                      setRevisitAt('');
                      await load();
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Schedule revisit
              </button>

              <div className="space-y-2 pt-2">
                {revisit.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs"
                    >
                      <span>
                        {new Date(
                          item.revisitAt
                        ).toLocaleString()}
                        {' · '}
                        {item.status}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          void run(
                            async () => {
                              await deleteRevisitBookmark(
                                item.id
                              );
                              await load();
                            }
                          )
                        }
                        className="text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {open === 'weekly' && (
            <div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    async () => {
                      setWeekly(
                        await fetchWeeklyReview()
                      );
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold"
              >
                Generate factual weekly review
              </button>

              {weekly && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric
                    value={
                      weekly.reflectionCount
                    }
                    label="reflections"
                  />

                  <Metric
                    value={
                      weekly.wordCount
                    }
                    label="words"
                  />

                  <Metric
                    value={
                      weekly.topTags
                        .map(
                          (item) =>
                            `#${item.tag}`
                        )
                        .join(' ') ||
                      'No repeated tags'
                    }
                    label="top tags"
                  />
                </div>
              )}
            </div>
          )}

          {open === 'decisions' && (
            <div className="space-y-3">
              <input
                value={decisionTitle}
                onChange={(event) =>
                  setDecisionTitle(
                    event.target.value
                  )
                }
                placeholder="Decision title"
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
              />

              <textarea
                value={decisionText}
                onChange={(event) =>
                  setDecisionText(
                    event.target.value
                  )
                }
                placeholder="What did you decide?"
                className="w-full rounded-xl border border-white/10 bg-black p-3 text-white"
              />

              <textarea
                value={decisionReasoning}
                onChange={(event) =>
                  setDecisionReasoning(
                    event.target.value
                  )
                }
                placeholder="Why?"
                className="w-full rounded-xl border border-white/10 bg-black p-3 text-white"
              />

              <button
                type="button"
                disabled={
                  busy ||
                  !decisionTitle.trim() ||
                  !decisionText.trim()
                }
                onClick={() =>
                  void run(
                    async () => {
                      await createDecision({
                        title:
                          decisionTitle,
                        decision:
                          decisionText,
                        reasoning:
                          decisionReasoning,
                        journalId:
                          selectedJournalId ||
                          undefined,
                      });

                      setDecisionTitle('');
                      setDecisionText('');
                      setDecisionReasoning('');
                      await load();
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Add decision
              </button>

              {decisions.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-3"
                  >
                    <strong className="text-sm">
                      {item.title}
                    </strong>

                    <p className="mt-1 text-xs text-white/70">
                      {item.decision}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {open === 'chains' && (
            <div className="space-y-3">
              <input
                value={chainTitle}
                onChange={(event) =>
                  setChainTitle(
                    event.target.value
                  )
                }
                placeholder="Chain title"
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white"
              />

              <div className="max-h-56 space-y-2 overflow-y-auto">
                {props.entries.map(
                  (entry) => {
                    const selected =
                      chainSelection.includes(
                        entry.id
                      );

                    return (
                      <label
                        key={entry.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setChainSelection(
                              (current) =>
                                selected
                                  ? current.filter(
                                      (id) =>
                                        id !==
                                        entry.id
                                    )
                                  : [
                                      ...current,
                                      entry.id,
                                    ]
                            )
                          }
                        />

                        <span className="line-clamp-1">
                          {entry.content}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                disabled={
                  busy ||
                  !chainTitle.trim() ||
                  chainSelection.length < 2
                }
                onClick={() =>
                  void run(
                    async () => {
                      await createChain({
                        title: chainTitle,
                        journalIds:
                          chainSelection,
                      });

                      setChainTitle('');
                      setChainSelection([]);
                      await load();
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Create reflection chain
              </button>

              {chains.map(
                (chain) => (
                  <div
                    key={chain.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs"
                  >
                    <strong>
                      {chain.title}
                    </strong>

                    <div className="mt-1 text-white/50">
                      {
                        chain.journalIds.length
                      }{' '}
                      linked reflections
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {open === 'assumptions' && (
            <div className="space-y-3">
              <textarea
                value={assumptionText}
                onChange={(event) =>
                  setAssumptionText(
                    event.target.value
                  )
                }
                placeholder="What assumption are you making?"
                className="w-full rounded-xl border border-white/10 bg-black p-3 text-white"
              />

              <button
                type="button"
                disabled={
                  busy ||
                  !assumptionText.trim()
                }
                onClick={() =>
                  void run(
                    async () => {
                      await createAssumption({
                        statement:
                          assumptionText,
                        journalId:
                          selectedJournalId ||
                          undefined,
                      });

                      setAssumptionText('');
                      await load();
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Add assumption
              </button>

              {assumptions.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-3"
                  >
                    <p className="text-xs">
                      {item.statement}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        'open',
                        'supported',
                        'challenged',
                        'invalidated',
                      ].map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              void run(
                                async () => {
                                  await updateAssumption(
                                    item.id,
                                    {
                                      status:
                                        status as
                                          AssumptionItem['status'],
                                    }
                                  );

                                  await load();
                                }
                              )
                            }
                            className={`rounded-lg px-2 py-1 text-[10px] ${
                              item.status === status
                                ? 'bg-amber-500/20 text-amber-200'
                                : 'bg-white/5 text-white/50'
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {open === 'versions' && (
            <div>
              <button
                type="button"
                disabled={
                  busy ||
                  !selectedJournalId
                }
                onClick={() =>
                  void run(
                    async () => {
                      setVersions(
                        await fetchJournalVersions(
                          selectedJournalId
                        )
                      );
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold"
              >
                Load version history
              </button>

              <div className="mt-3 space-y-2">
                {versions.map(
                  (version) => (
                    <div
                      key={version.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <div className="text-[10px] text-white/40">
                        {new Date(
                          version.createdAt
                        ).toLocaleString()}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-xs text-white/70">
                        {
                          version.previousContent
                        }
                      </p>
                    </div>
                  )
                )}

                {versions.length === 0 && (
                  <p className="text-xs text-white/45">
                    No previous versions loaded.
                  </p>
                )}
              </div>
            </div>
          )}

          {open === 'graph' && (
            <div>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    async () => {
                      setGraph(
                        await fetchKnowledgeGraph()
                      );
                    }
                  )
                }
                className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold"
              >
                Build factual graph
              </button>

              {graph && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <GraphList
                    title={`${graph.nodes.length} nodes`}
                    lines={
                      graph.nodes
                        .slice(0, 50)
                        .map(
                          (node) =>
                            `${node.type} · ${node.label}`
                        )
                    }
                  />

                  <GraphList
                    title={`${graph.edges.length} relationships`}
                    lines={
                      graph.edges
                        .slice(0, 50)
                        .map(
                          (edge) =>
                            `${edge.source} → ${edge.target} · ${edge.type}`
                        )
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Metric(
  props: {
    value:
      string | number;
    label:
      string;
  }
) {
  return (
    <div className="rounded-xl bg-black/35 p-4">
      <div className="text-2xl font-bold">
        {props.value}
      </div>

      <div className="text-xs text-white/50">
        {props.label}
      </div>
    </div>
  );
}

function GraphList(
  props: {
    title: string;
    lines: string[];
  }
) {
  return (
    <div className="rounded-xl bg-black/35 p-4">
      <strong className="text-sm">
        {props.title}
      </strong>

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {props.lines.map(
          (
            line,
            index
          ) => (
            <div
              key={`${line}-${index}`}
              className="rounded-lg bg-white/5 p-2 text-[11px] text-white/60"
            >
              {line}
            </div>
          )
        )}
      </div>
    </div>
  );
}
