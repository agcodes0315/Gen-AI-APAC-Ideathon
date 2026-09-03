import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Edit3,
  X,
  RefreshCw,
  AlertCircle,
  Tag,
  ShieldCheck,
  HelpCircle,
  Brain,
  Clock3,
} from 'lucide-react';

import type {
  ThoughtSnapshotProposal,
  ThoughtSnapshot,
  MemoryRetention,
} from '../types.ts';

import { approveThoughtSnapshot } from '../lib/api.ts';

interface ThoughtSnapshotCardProps {
  proposal: ThoughtSnapshotProposal;
  onAccepted: (snapshot: ThoughtSnapshot) => void;
  onRejected: () => void;
  onRetryGenerate?: () => void;
}

export const ThoughtSnapshotCard: React.FC<ThoughtSnapshotCardProps> = ({
  proposal,
  onAccepted,
  onRejected,
  onRetryGenerate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPosition, setEditedPosition] = useState(proposal.positionStatement);
  const [editedTopic, setEditedTopic] = useState(proposal.topic);
  const [editedTagsInput, setEditedTagsInput] = useState(proposal.tags.join(', '));
  const [memoryRetention, setMemoryRetention] =
    useState<MemoryRetention>('until_removed');

  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleApprove = async (edited: boolean) => {
    const position = edited
      ? editedPosition.trim()
      : proposal.positionStatement.trim();

    const topic = edited
      ? editedTopic.trim()
      : proposal.topic.trim();

    const tags = edited
      ? editedTagsInput
          .split(',')
          .map((tag) =>
            tag
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '')
          )
          .filter(Boolean)
          .slice(0, 5)
      : proposal.tags;

    if (!position) {
      setError('Position statement cannot be empty.');
      return;
    }

    if (!topic) {
      setError('Topic cannot be empty.');
      return;
    }

    try {
      setApproving(true);
      setError(null);

      const res = await approveThoughtSnapshot({
        sourceJournalId: proposal.sourceJournalId,
        positionStatement: position,
        topic,
        tags,
        userEdited: edited,
        memoryRetention,
      });

      onAccepted(res.snapshot);
    } catch (err: unknown) {
      setError(
        (err as Error)?.message ||
          'Failed to approve thought snapshot.'
      );
    } finally {
      setApproving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPosition(proposal.positionStatement);
    setEditedTopic(proposal.topic);
    setEditedTagsInput(proposal.tags.join(', '));
    setError(null);
  };

  return (
    <article
      id={`thought-snapshot-proposal-${proposal.sourceJournalId}`}
      className="
        w-full
        lg:w-[calc(200%+1.5rem)]
        max-w-none
        overflow-hidden
        rounded-[22px]
        border
        border-white/15
        bg-[rgba(0,0,0,0.58)]
        shadow-[0_18px_50px_rgba(0,0,0,0.22)]
        backdrop-blur-[3px]
        animate-fade-in
      "
    >
      {/* ======================================================
          TOP HORIZONTAL HEADER BAR
         ====================================================== */}
      <header
        className="
          flex
          flex-col
          gap-3
          border-b
          border-white/15
          bg-[rgba(0,0,0,0.64)]
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/15
              bg-[rgba(0,0,0,0.82)]
              text-amber-200
            "
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-[15px] font-bold leading-tight text-white">
                Suggested Thought Snapshot
              </h3>

              <span
                className="
                  rounded-full
                  border
                  border-amber-300/35
                  bg-[rgba(0,0,0,0.82)]
                  px-2.5
                  py-1
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-amber-200
                "
              >
                Pending Consent
              </span>
            </div>

            <p className="mt-1 text-[10px] leading-relaxed text-white/68">
              Gemini’s proposed interpretation of this reflection.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo((current) => !current)}
          className="
            self-start
            rounded-lg
            p-2
            text-white/65
            transition-colors
            hover:bg-white/10
            hover:text-white
            sm:self-auto
          "
          title="Why am I seeing this?"
          aria-label="Explain this thought snapshot"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </header>

      {/* ======================================================
          MAIN HORIZONTAL CONTENT BAR
          3 balanced columns on desktop.
          No fixed 250/300px columns, so content cannot squeeze.
         ====================================================== */}
      <div
        className="
          grid
          grid-cols-1
          gap-0
          lg:grid-cols-[minmax(0,1.65fr)_minmax(250px,0.85fr)_minmax(220px,0.7fr)]
        "
      >
        {/* LEFT: proposal + metadata */}
        <section
          className="
            min-w-0
            border-b
            border-white/15
            bg-[rgba(0,0,0,0.62)]
            p-4
            lg:border-b-0
            lg:border-r
          "
        >
          {error && (
            <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-[rgba(0,0,0,0.82)] p-3 text-[10px] text-red-100">
              <div className="flex min-w-0 items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <span className="break-words">{error}</span>
              </div>

              {onRetryGenerate && (
                <button
                  type="button"
                  onClick={onRetryGenerate}
                  className="inline-flex shrink-0 items-center gap-1 font-semibold text-red-200 hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          )}

          {!isEditing ? (
            <>
              <div className="rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-3.5">
                <div className="mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 shrink-0 text-amber-200" />

                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-white/50">
                    Proposed Position
                  </span>
                </div>

                <blockquote className="break-words font-serif text-[13px] italic leading-relaxed text-white/80 sm:text-[14px]">
                  “{proposal.positionStatement}”
                </blockquote>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(150px,0.7fr)_minmax(0,1.3fr)]">
                <div className="min-w-0 rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-2.5">
                  <span className="text-[16px] font-bold uppercase tracking-wide text-white/70">
                    Topic
                  </span>

                  <p className="mt-1 break-words text-[16px] font-semibold leading-snug text-white/82">
                    {proposal.topic}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-2.5">
                  <div className="flex items-center gap-1 text-[16px] font-bold uppercase tracking-wide text-white/70">
                    <Tag className="h-3 w-3" />
                    Tags
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {proposal.tags.length > 0 ? (
                      proposal.tags.map((tag) => (
                        <span
                          key={tag}
                          className="
                            max-w-full
                            rounded-full
                            border
                            border-white/15
                            bg-[rgba(0,0,0,0.78)]
                            px-2
                            py-1
                            text-[16px]
                            font-semibold
                            text-white/70
                          "
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[8.5px] text-white/40">
                        No tags
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-3.5">
              <div>
                <label
                  htmlFor="edit-position-input"
                  className="text-[9px] font-bold text-white/82"
                >
                  Refine Position Statement
                </label>

                <textarea
                  id="edit-position-input"
                  value={editedPosition}
                  onChange={(event) => setEditedPosition(event.target.value)}
                  className="
                    mt-1.5
                    h-20
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(0,0,0,0.78)]
                    p-2.5
                    text-[10px]
                    leading-relaxed
                    text-white/82
                    outline-none
                    placeholder:text-white/35
                    focus:border-amber-300/45
                  "
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  id="edit-topic-input"
                  type="text"
                  value={editedTopic}
                  onChange={(event) => setEditedTopic(event.target.value)}
                  className="
                    min-w-0
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(0,0,0,0.78)]
                    px-3
                    py-2
                    text-[10px]
                    text-white/82
                    outline-none
                    focus:border-amber-300/45
                  "
                  placeholder="Primary topic"
                />

                <input
                  id="edit-tags-input"
                  type="text"
                  value={editedTagsInput}
                  onChange={(event) => setEditedTagsInput(event.target.value)}
                  className="
                    min-w-0
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(0,0,0,0.78)]
                    px-3
                    py-2
                    text-[10px]
                    text-white/82
                    outline-none
                    focus:border-amber-300/45
                  "
                  placeholder="tags, comma, separated"
                />
              </div>
            </div>
          )}
        </section>

        {/* MIDDLE: memory permission */}
        <section
          className="
            min-w-0
            border-b
            border-white/15
            bg-[rgba(0,0,0,0.64)]
            p-4
            lg:border-b-0
            lg:border-r
          "
        >
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-white/62" />
            <p className="text-[9px] font-bold text-white">
              Memory permission
            </p>
          </div>

          <p className="mt-2 text-[6.5px] leading-relaxed text-white/60">
            Choose how long this approved interpretation may be reused for
            future Thought Diff matching.
          </p>

          <div
            className="
              mt-3
              flex
              w-full
              items-center
              justify-between
              gap-3
              border-y
              border-white/15
              bg-[rgba(0,0,0,0.82)]
              px-3
              py-2
            "
          >
            <span className="shrink-0 text-[8px] font-semibold text-white/45">
              Retention
            </span>

            <select
              id="snapshot-memory-retention"
              value={memoryRetention}
              onChange={(event) =>
                setMemoryRetention(event.target.value as MemoryRetention)
              }
              disabled={approving}
              className="
                min-w-0
                max-w-[150px]
                appearance-none
                border-0
                bg-transparent
                px-0
                py-0
                text-right
                text-[9.5px]
                font-semibold
                text-white/82
                outline-none
                disabled:opacity-60
              "
              aria-label="Thought Snapshot memory retention"
            >
              <option value="until_removed">Until I remove it</option>
              <option value="30_days">30 days</option>
              <option value="180_days">6 months</option>
              <option value="365_days">1 year</option>
            </select>
          </div>

          <div className="mt-3 rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-2">
            <p className="text-[6px] leading-relaxed text-white/60">
              <strong className="text-white/85">
                Time-bound consent:
              </strong>{' '}
              Expired snapshots are not used as evidence for a new Thought Diff.
            </p>
          </div>
        </section>

        {/* RIGHT: consent + actions */}
        <section
          className="
            flex
            min-w-0
            flex-col
            justify-between
            gap-4
            bg-[rgba(0,0,0,0.62)]
            p-4
          "
        >
          <div className="rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

              <p className="text-[6.5px] leading-relaxed text-white/66">
                <strong className="text-white">
                  Nothing becomes memory automatically.
                </strong>{' '}
                Accepting this snapshot is the consent boundary.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              id="btn-reject-snapshot"
              type="button"
              onClick={onRejected}
              disabled={approving}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-3
                py-2
                text-[7px]
                font-semibold
                text-white/55
                transition-colors
                hover:bg-white/10
                hover:text-white
                disabled:opacity-60
              "
            >
              <X className="h-4 w-4" />
              Reject
            </button>

            {!isEditing ? (
              <>
                <button
                  id="btn-edit-snapshot"
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError(null);
                  }}
                  disabled={approving}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(0,0,0,0.78)]
                    px-3
                    py-2
                    text-[7px]
                    font-semibold
                    text-white/72
                    transition-colors
                    hover:bg-[rgba(0,0,0,0.86)]
                    disabled:opacity-60
                  "
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>

                <button
                  id="btn-accept-snapshot"
                  type="button"
                  onClick={() => void handleApprove(false)}
                  disabled={approving}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(92,78,70,0.92)]
                    px-3
                    py-2
                    text-[7px]
                    font-bold
                    text-white
                    transition-colors
                    hover:bg-[rgba(108,90,80,0.98)]
                    disabled:opacity-60
                  "
                >
                  {approving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  Accept
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={approving}
                  className="
                    rounded-lg
                    px-3
                    py-2
                    text-[7px]
                    font-semibold
                    text-white/55
                    hover:bg-white/10
                    disabled:opacity-60
                  "
                >
                  Cancel
                </button>

                <button
                  id="btn-save-edited-snapshot"
                  type="button"
                  onClick={() => void handleApprove(true)}
                  disabled={approving}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-white/15
                    bg-[rgba(92,78,70,0.92)]
                    px-3
                    py-2
                    text-[7px]
                    font-bold
                    text-white
                    transition-colors
                    hover:bg-[rgba(108,90,80,0.98)]
                    disabled:opacity-60
                  "
                >
                  {approving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  Save & Accept
                </button>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Optional explanation spans full width instead of squeezing a column */}
      {showInfo && (
        <div className="border-t border-white/15 bg-[rgba(0,0,0,0.64)] px-5 py-3">
          <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

            <p className="text-[9px] leading-relaxed text-white/68">
              This is an AI-suggested interpretation grounded only in your saved
              reflection. It becomes reusable memory only if you explicitly
              accept or edit it.
            </p>
          </div>
        </div>
      )}
    </article>
  );
};
