import React, { useState } from 'react';
import {
  Plus,
  X,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  EyeOff,
  Check,
} from 'lucide-react';
import { createJournalEntry, proposeThoughtSnapshot, generateThoughtDiff } from '../lib/api.ts';
import { ThoughtSnapshotCard } from './ThoughtSnapshotCard.tsx';
import { ThoughtDiffCard } from './ThoughtDiffCard.tsx';
import type {
  JournalEntry,
  ThoughtSnapshotProposal,
  ThoughtSnapshot,
  ThoughtDiff,
  ThoughtDiffProvenance,
} from '../types.ts';

interface JournalEditorProps {
  onEntrySaved: (entry: JournalEntry) => void;
  externalTags?: string[];
  onClearExternalTags?: () => void;
  initialPrivateSession?: boolean;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  onEntrySaved,
  externalTags = [],
  onClearExternalTags,
  initialPrivateSession = false,
}) => {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivateSession, setIsPrivateSession] = useState(initialPrivateSession);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initialPrivateSession if prop changes
  React.useEffect(() => {
    if (typeof initialPrivateSession === 'boolean') {
      setIsPrivateSession(initialPrivateSession);
    }
  }, [initialPrivateSession]);

  // Thought Snapshot Proposal State
  const [lastSavedJournal, setLastSavedJournal] = useState<JournalEntry | null>(null);
  const [generatingSnapshot, setGeneratingSnapshot] = useState(false);
  const [snapshotProposal, setSnapshotProposal] = useState<ThoughtSnapshotProposal | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [approvedSnapshot, setApprovedSnapshot] = useState<ThoughtSnapshot | null>(null);

  // Thought Diff State (Phase 3B)
  const [evaluatingDiff, setEvaluatingDiff] = useState(false);
  const [generatedDiff, setGeneratedDiff] = useState<ThoughtDiff | null>(null);
  const [generatedDiffProvenance, setGeneratedDiffProvenance] = useState<ThoughtDiffProvenance | null>(null);
  const [diffNotice, setDiffNotice] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  // Sync external tags from Brainstorm chat when passed
  React.useEffect(() => {
    if (externalTags.length > 0) {
      setTags((prev) => {
        const combined = new Set([...prev, ...externalTags]);
        return Array.from(combined);
      });
      onClearExternalTags?.();
    }
  }, [externalTags, onClearExternalTags]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();

    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleGenerateProposal = async (journalId: string) => {
    try {
      setGeneratingSnapshot(true);
      setSnapshotError(null);
      setSnapshotProposal(null);
      setApprovedSnapshot(null);

      const res = await proposeThoughtSnapshot(journalId);
      if (res.success && res.proposal) {
        setSnapshotProposal(res.proposal);
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Could not generate Suggested Thought Snapshot.';
      setSnapshotError(msg);
    } finally {
      setGeneratingSnapshot(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write some content in your reflection before saving.');
      return;
    }

    // Handle Private Session mode
    if (isPrivateSession) {
      setSuccessMessage('Private session reflection acknowledged. (No data was saved to Firestore history)');
      setContent('');
      setTags([]);
      setSnapshotProposal(null);
      setApprovedSnapshot(null);
      setTimeout(() => setSuccessMessage(null), 4000);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      setSnapshotProposal(null);
      setApprovedSnapshot(null);
      setSnapshotError(null);

      const res = await createJournalEntry(content.trim(), tags);
      const savedJournal = res.journal;
      setLastSavedJournal(savedJournal);
      setSuccessMessage('Reflection saved securely to your private journal.');
      setContent('');
      setTags([]);
      onEntrySaved(savedJournal);

      // Trigger non-blocking thought snapshot proposal
      handleGenerateProposal(savedJournal.id);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to save reflection.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluateThoughtDiff = async (snapshotId: string) => {
    try {
      setEvaluatingDiff(true);
      setDiffError(null);
      setDiffNotice(null);
      setGeneratedDiff(null);
      setGeneratedDiffProvenance(null);

      const res = await generateThoughtDiff(snapshotId);
      if (res.diffCreated && res.diff) {
        setGeneratedDiff(res.diff);
        if (res.provenance) {
          setGeneratedDiffProvenance(res.provenance);
        }
      } else if (res.message) {
        setDiffNotice(res.message);
      }
    } catch (err: unknown) {
      console.warn('[MirrorTrace] Thought diff evaluation error:', err);
      // Non-blocking error handling
      setDiffError(
        (err as Error)?.message ||
          'Could not complete Thought Diff comparison. Journal and snapshots remain saved.'
      );
    } finally {
      setEvaluatingDiff(false);
    }
  };

  const handleSnapshotAccepted = (snapshot: ThoughtSnapshot) => {
    setApprovedSnapshot(snapshot);
    setSnapshotProposal(null);
    if (lastSavedJournal) {
      onEntrySaved({
        ...lastSavedJournal,
        snapshotId: snapshot.id,
      });
    }

    // Automatically trigger Thought Diff candidate search & evaluation (Phase 3B)
    handleEvaluateThoughtDiff(snapshot.id);
  };

  const handleSnapshotRejected = () => {
    setSnapshotProposal(null);
    setSnapshotError(null);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      {/* Compose Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
              <span>Compose Reflection</span>
            </h2>
            <div className="flex items-center gap-3">
              {/* Private Session Mode Switch */}
              <button
                type="button"
                onClick={() => setIsPrivateSession(!isPrivateSession)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isPrivateSession
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
                title="Private Session: Disables persistence and snapshot generation"
              >
                {isPrivateSession ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-purple-700" />
                    <span>Private Session (Active)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Private Session</span>
                  </>
                )}
              </button>

              <span className="text-xs text-stone-600 font-mono">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
          </div>

          {/* Private Session Notice */}
          {isPrivateSession && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start gap-2 animate-fade-in">
              <EyeOff className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold">Private Session Mode Active</span>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Reflections written in this mode will NOT be stored to Firestore journal history, and no Thought Snapshots or Thought Diffs will be generated.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3 text-xs text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 font-medium text-red-700 hover:text-red-900 underline shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry Save
              </button>
            </div>
          )}

          {/* Success Toast */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Journal Textarea */}
          <textarea
            id="journal-input-area"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? Write down a decision, challenge, perspective, or reflection..."
            className="w-full h-64 p-4 rounded-lg bg-stone-50/70 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all resize-none leading-relaxed"
          />

          {/* Topic Tags Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-600">
              Topic Tags (helps match related future reflections):
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-amber-700 hover:text-amber-950 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  id="tag-input-field"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag (e.g. career)..."
                  className="w-36 px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-xs transition-colors cursor-pointer"
                  title="Add tag"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={() => {
              setContent('');
              setTags([]);
              setError(null);
            }}
            disabled={saving || (!content && tags.length === 0)}
            className="text-xs text-stone-600 hover:text-stone-900 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Clear Draft
          </button>

          <button
            id="btn-save-journal"
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-semibold tracking-wide transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-100/30 border-t-amber-100 rounded-full animate-spin" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : isPrivateSession ? 'Acknowledge Reflection' : 'Save to Journal'}</span>
          </button>
        </div>
      </div>

      {/* Generating Proposal Spinner */}
      {generatingSnapshot && (
        <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center justify-center gap-3 text-xs text-amber-900 animate-pulse">
          <div className="w-4 h-4 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
          <span className="font-serif">Grounding reflection to propose Suggested Thought Snapshot...</span>
        </div>
      )}

      {/* Snapshot Proposal Error (Non-blocking with Retry) */}
      {snapshotError && lastSavedJournal && !generatingSnapshot && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Could not generate Suggested Thought Snapshot automatically. (Journal reflection remains saved)</span>
          </div>
          <button
            onClick={() => handleGenerateProposal(lastSavedJournal.id)}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry Proposal
          </button>
        </div>
      )}

      {/* Thought Snapshot Proposal Card (Pending User Consent) */}
      {snapshotProposal && !generatingSnapshot && (
        <ThoughtSnapshotCard
          proposal={snapshotProposal}
          onAccepted={handleSnapshotAccepted}
          onRejected={handleSnapshotRejected}
          onRetryGenerate={lastSavedJournal ? () => handleGenerateProposal(lastSavedJournal.id) : undefined}
        />
      )}

      {/* Approved Snapshot Confirmation Badge */}
      {approvedSnapshot && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900 animate-fade-in">
          <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <span>Thought Snapshot Approved & Stored</span>
              {approvedSnapshot.userEdited && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-normal">
                  User Edited
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-800 italic">
              "{approvedSnapshot.positionStatement}"
            </p>
            <p className="text-[10px] text-emerald-700 font-mono">
              Topic: {approvedSnapshot.topic} • Stored securely under users/&#123;uid&#125;/thoughtSnapshots
            </p>
          </div>
        </div>
      )}

      {/* Evaluating Thought Diff Candidate Progress */}
      {evaluatingDiff && (
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-center gap-3 text-xs text-amber-900 animate-pulse">
          <div className="w-4 h-4 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
          <span className="font-serif">Searching for related approved reflections to evaluate Thought Diff...</span>
        </div>
      )}

      {/* Thought Diff Notice (e.g. not enough evidence or no earlier candidate) */}
      {diffNotice && !evaluatingDiff && !generatedDiff && (
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{diffNotice}</span>
        </div>
      )}

      {/* Thought Diff Non-blocking Error */}
      {diffError && !evaluatingDiff && !generatedDiff && approvedSnapshot && (
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs text-stone-700">
          <span>{diffError}</span>
          <button
            onClick={() => handleEvaluateThoughtDiff(approvedSnapshot.id)}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry Diff
          </button>
        </div>
      )}

      {/* Generated Thought Diff Card */}
      {generatedDiff && (
        <ThoughtDiffCard
          diff={generatedDiff}
          initialProvenance={generatedDiffProvenance || undefined}
        />
      )}
    </div>
  );
};

