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

  const [editedPosition, setEditedPosition] =
    useState(proposal.positionStatement);

  const [editedTopic, setEditedTopic] =
    useState(proposal.topic);

  const [editedTagsInput, setEditedTagsInput] =
    useState(proposal.tags.join(', '));

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
      const msg =
        (err as Error)?.message ||
        'Failed to approve thought snapshot.';

      setError(msg);
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
        overflow-hidden
        rounded-[22px]
        border
        border-white/15
        bg-[rgba(0,0,0,0.82)]
        shadow-[0_18px_50px_rgba(0,0,0,0.28)]
        animate-fade-in
      "
    >
      {/* Header */}
      <div
        className="
          border-b
          border-white/15
          bg-[rgba(0,0,0,0.82)]
          px-5
          py-4
        "
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
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
                bg-[rgba(92,78,70,0.92)]
                text-white
              "
            >
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-[15px] font-bold text-white">
                  Suggested Thought Snapshot
                </h3>

                <span
                  className="
                    rounded-full
                    border
                    border-amber-300/35
                    bg-black/70
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

              <p className="mt-1 text-[9.5px] leading-relaxed text-white/70">
                Gemini’s proposed interpretation of this reflection.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInfo((current) => !current)}
            className="
              rounded-lg
              p-2
              text-white/70
              transition-colors
              hover:bg-white/10
              hover:text-white
            "
            title="Why am I seeing this?"
            aria-label="Explain this thought snapshot"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 bg-[rgba(0,0,0,0.82)] p-5">
        {/* Consent explanation */}
        {showInfo && (
          <div className="rounded-2xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

              <div>
                <p className="text-[11px] font-bold text-white">
                  Interpretation Integrity & Consent
                </p>

                <p className="mt-1 text-[9.5px] leading-relaxed text-white/70">
                  This is an AI-suggested interpretation grounded only in your
                  saved reflection. It does <strong>not</strong> become
                  persistent memory or participate in future Thought Diff
                  comparisons unless you explicitly accept or edit it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-[10.5px] text-red-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{error}</span>
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
            {/* Main proposal */}
            <div className="rounded-2xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-200" />

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-white/55">
                  Proposed Position
                </span>
              </div>

              <blockquote className="font-serif text-[12.5px] italic leading-relaxed text-white/80 sm:text-[14.5px]">
                “{proposal.positionStatement}”
              </blockquote>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
              <div className="rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-2.5">
                <span className="text-[8px] font-bold uppercase tracking-wide text-white/60">
                  Topic
                </span>

                <p className="mt-1 text-[11px] font-semibold text-white/85">
                  {proposal.topic}
                </p>
              </div>

              {proposal.tags.length > 0 && (
                <div className="rounded-xl border border-white/15 bg-[rgba(0,0,0,0.82)] px-3 py-2.5">
                  <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-white/55">
                    <Tag className="h-3 w-3" />
                    Tags
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {proposal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          rounded-full
                          border
                          border-white/15
                          bg-black/65
                          px-2
                          py-1
                          text-[8.5px]
                          font-semibold
                          text-white/75
                        "
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Edit Mode */
          <div className="space-y-4 rounded-2xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-4">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-position-input"
                className="text-[11px] font-bold text-white/85"
              >
                Refine Position Statement
              </label>

              <textarea
                id="edit-position-input"
                value={editedPosition}
                onChange={(event) =>
                  setEditedPosition(event.target.value)
                }
                className="
                  h-24
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-white/15
                  bg-black/70
                  p-3
                  text-[10.5px]
                  leading-relaxed
                  text-white/85
                  outline-none
                  transition-colors
                  placeholder:text-white/35
                  focus:border-amber-300/45
                "
                placeholder="State your position clearly and concisely..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-topic-input"
                  className="text-[11px] font-bold text-white/85"
                >
                  Primary Topic
                </label>

                <input
                  id="edit-topic-input"
                  type="text"
                  value={editedTopic}
                  onChange={(event) =>
                    setEditedTopic(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/15
                    bg-black/70
                    px-3
                    py-2.5
                    text-[10.5px]
                    text-white/85
                    outline-none
                    transition-colors
                    placeholder:text-white/35
                    focus:border-amber-300/45
                  "
                  placeholder="e.g. Career Planning"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-tags-input"
                  className="text-[11px] font-bold text-white/85"
                >
                  Tags
                </label>

                <input
                  id="edit-tags-input"
                  type="text"
                  value={editedTagsInput}
                  onChange={(event) =>
                    setEditedTagsInput(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/15
                    bg-black/70
                    px-3
                    py-2.5
                    text-[10.5px]
                    text-white/85
                    outline-none
                    transition-colors
                    placeholder:text-white/35
                    focus:border-amber-300/45
                  "
                  placeholder="career, mba, technology"
                />

                <p className="text-[7.5px] text-white/40">
                  Comma-separated, maximum 5 tags.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time-bound memory consent */}
        <div className="rounded-2xl border border-white/15 bg-[rgba(0,0,0,0.82)] p-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-bold text-white">
                Memory permission
              </p>

              <p className="mt-1 text-[8.5px] leading-relaxed text-white/65">
                Choose how long this approved interpretation may be reused for
                future Thought Diff matching. Expiry does not delete your
                journal or snapshot; it only removes the snapshot from future
                AI-memory comparisons.
              </p>
            </div>

            {/* Horizontal retention layer */}
            <div
              className="
                flex
                w-full
                items-center
                justify-between
                gap-4
                border-y
                border-white/15
                bg-black/55
                px-3
                py-2
              "
            >
              <span className="text-[9px] font-semibold text-white/55">
                Retention
              </span>

              <select
                id="snapshot-memory-retention"
                value={memoryRetention}
                onChange={(event) =>
                  setMemoryRetention(
                    event.target.value as MemoryRetention
                  )
                }
                disabled={approving}
                className="
                  w-auto
                  min-w-[180px]
                  appearance-none
                  border-0
                  bg-transparent
                  px-0
                  py-1
                  text-right
                  text-[11px]
                  font-semibold
                  text-white/85
                  outline-none
                  disabled:opacity-60
                "
                aria-label="Thought Snapshot memory retention"
              >
                <option value="until_removed">
                  Until I remove it
                </option>

                <option value="30_days">
                  30 days
                </option>

                <option value="180_days">
                  6 months
                </option>

                <option value="365_days">
                  1 year
                </option>
              </select>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/15 bg-black/70 px-3 py-2">
            <p className="text-[8.5px] leading-relaxed text-white/65">
              <strong className="text-white/90">
                Time-bound consent:
              </strong>{' '}
              MirrorTrace will not use an expired snapshot as evidence for a
              new Thought Diff unless you approve a new interpretation later.
            </p>
          </div>
        </div>

        {/* Explicit consent boundary */}
        <div className="rounded-xl border border-white/10 bg-black/85 px-4 py-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

            <p className="text-[8.5px] leading-relaxed text-white/70">
              <strong className="text-white">
                Nothing becomes memory automatically.
              </strong>{' '}
              Accepting this snapshot is the consent boundary that makes it
              eligible for future comparisons.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            id="btn-reject-snapshot"
            type="button"
            onClick={onRejected}
            disabled={approving}
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              px-3
              py-2
              text-[10.5px]
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

          <div className="flex flex-wrap justify-end gap-2">
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
                    rounded-xl
                    border
                    border-white/15
                    bg-[rgba(0,0,0,0.82)]
                    px-3.5
                    py-2
                    text-[10.5px]
                    font-semibold
                    text-white/75
                    transition-colors
                    hover:bg-black/95
                    disabled:opacity-60
                  "
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Interpretation
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
                    rounded-xl
                    border
                    border-white/15
                    bg-[rgba(92,78,70,0.92)]
                    px-4
                    py-2
                    text-[10.5px]
                    font-bold
                    text-white
                    shadow-sm
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

                  Accept Snapshot
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={approving}
                  className="
                    rounded-xl
                    px-3.5
                    py-2
                    text-[10.5px]
                    font-semibold
                    text-white/55
                    transition-colors
                    hover:bg-white/10
                    disabled:opacity-60
                  "
                >
                  Cancel Edit
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
                    rounded-xl
                    border
                    border-white/15
                    bg-[rgba(92,78,70,0.92)]
                    px-4
                    py-2
                    text-[10.5px]
                    font-bold
                    text-white
                    shadow-sm
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
        </div>
      </div>
    </article>
  );
};
