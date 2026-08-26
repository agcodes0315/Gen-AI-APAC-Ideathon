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
} from 'lucide-react';
import type { ThoughtSnapshotProposal, ThoughtSnapshot } from '../types.ts';
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
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleApprove = async (edited: boolean) => {
    const position = edited ? editedPosition.trim() : proposal.positionStatement.trim();
    const topic = edited ? editedTopic.trim() : proposal.topic.trim();
    const tags = edited
      ? editedTagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
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
      });

      onAccepted(res.snapshot);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to approve thought snapshot.';
      setError(msg);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div
      id={`thought-snapshot-proposal-${proposal.sourceJournalId}`}
      className="p-5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-4 shadow-xs animate-fade-in text-stone-900"
    >
      {/* Header with Title and Provenance Info Button */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-amber-950 flex items-center gap-1.5">
              <span>Suggested Thought Snapshot</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 font-medium">
                Pending Consent
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 text-amber-800 hover:text-amber-950 rounded transition-colors cursor-pointer"
            title="Why am I seeing this?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Provenance info banner */}
      {showInfo && (
        <div className="p-3 bg-amber-100/70 border border-amber-300/80 rounded-lg text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
            <span>Interpretation Integrity & Consent</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            This snapshot is an AI-suggested interpretation grounded solely in your saved reflection.
            It will <strong>not</strong> become part of your persistent history or future Thought Diff
            comparisons unless you explicitly accept or edit it.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetryGenerate && (
            <button
              onClick={onRetryGenerate}
              className="flex items-center gap-1 font-semibold text-red-700 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry Generation
            </button>
          )}
        </div>
      )}

      {/* Content View or Edit Form */}
      {!isEditing ? (
        <div className="space-y-3">
          <blockquote className="text-sm font-serif italic text-amber-950 leading-relaxed bg-white/60 p-3.5 rounded-lg border border-amber-200/50">
            "{proposal.positionStatement}"
          </blockquote>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-700">
            <div>
              <span className="font-semibold text-amber-950">Topic: </span>
              <span className="font-medium text-stone-800">{proposal.topic}</span>
            </div>

            {proposal.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-amber-950 flex items-center gap-0.5">
                  <Tag className="w-3 h-3" /> Tags:
                </span>
                {proposal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100/90 text-amber-900 border border-amber-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 bg-white/80 p-3.5 rounded-lg border border-amber-200">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">
              Refine Position Statement:
            </label>
            <textarea
              id="edit-position-input"
              value={editedPosition}
              onChange={(e) => setEditedPosition(e.target.value)}
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-800 leading-relaxed resize-none h-20"
              placeholder="State your position clearly and concisely..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Primary Topic:</label>
              <input
                id="edit-topic-input"
                type="text"
                value={editedTopic}
                onChange={(e) => setEditedTopic(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-800"
                placeholder="e.g. Career Planning"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Tags (comma-separated, max 5):
              </label>
              <input
                id="edit-tags-input"
                type="text"
                value={editedTagsInput}
                onChange={(e) => setEditedTagsInput(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:border-amber-800"
                placeholder="career, mba, technology"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: Reject, Edit, Accept */}
      <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
        <button
          id="btn-reject-snapshot"
          type="button"
          onClick={onRejected}
          disabled={approving}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                id="btn-edit-snapshot"
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={approving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 bg-white border border-amber-300 hover:bg-amber-100/70 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                id="btn-accept-snapshot"
                type="button"
                onClick={() => handleApprove(false)}
                disabled={approving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 transition-colors shadow-xs cursor-pointer"
              >
                {approving ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-100/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Accept</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedPosition(proposal.positionStatement);
                  setEditedTopic(proposal.topic);
                  setEditedTagsInput(proposal.tags.join(', '));
                }}
                disabled={approving}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>

              <button
                id="btn-save-edited-snapshot"
                type="button"
                onClick={() => handleApprove(true)}
                disabled={approving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 transition-colors shadow-xs cursor-pointer"
              >
                {approving ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-100/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Save & Accept</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
