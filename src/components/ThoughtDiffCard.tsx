import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { ThoughtDiff, ThoughtDiffProvenance, DiffRelationshipStatus } from '../types.ts';
import { submitDiffFeedback, fetchDiffProvenance } from '../lib/api.ts';

interface ThoughtDiffCardProps {
  diff: ThoughtDiff;
  initialProvenance?: ThoughtDiffProvenance;
  onStatusChange?: (newStatus: DiffRelationshipStatus) => void;
}

export const ThoughtDiffCard: React.FC<ThoughtDiffCardProps> = ({
  diff,
  initialProvenance,
  onStatusChange,
}) => {
  const [provenance, setProvenance] = useState<ThoughtDiffProvenance | null>(
    initialProvenance || null
  );
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [loadingProvenance, setLoadingProvenance] = useState(false);
  const [provenanceError, setProvenanceError] = useState<string | null>(null);

  const [status, setStatus] = useState<DiffRelationshipStatus>(diff.relationshipStatus);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedbackMsg, setStatusFeedbackMsg] = useState<string | null>(null);

  const handleOpenProvenance = async () => {
    setShowProvenanceModal(true);
    if (!provenance) {
      try {
        setLoadingProvenance(true);
        setProvenanceError(null);
        const data = await fetchDiffProvenance(diff.id);
        setProvenance(data);
      } catch (err: unknown) {
        setProvenanceError(
          (err as Error)?.message || 'Unable to retrieve provenance details at this time.'
        );
      } finally {
        setLoadingProvenance(false);
      }
    }
  };

  const handleFeedback = async (newStatus: DiffRelationshipStatus) => {
    try {
      setUpdatingStatus(true);
      setStatusFeedbackMsg(null);
      await submitDiffFeedback(diff.id, newStatus);
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      if (newStatus === 'useful') {
        setStatusFeedbackMsg('Marked as helpful and accurate.');
      } else if (newStatus === 'not_related') {
        setStatusFeedbackMsg('Marked as not related. Excluded from future comparisons.');
      } else if (newStatus === 'incorrect_interpretation') {
        setStatusFeedbackMsg('Feedback recorded. Interpretation flagged.');
      }
      setTimeout(() => setStatusFeedbackMsg(null), 3500);
    } catch (err: unknown) {
      console.error('Failed to submit diff feedback:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      <div
        id={`thought-diff-${diff.id}`}
        className="bg-stone-50/90 border border-stone-200 rounded-xl p-5 shadow-xs space-y-4 text-stone-900 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-900 text-amber-50 flex items-center justify-center shadow-xs">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold text-stone-900 tracking-tight">
                  Thought Diff
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                  {diff.topic}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans">
                Evidence-grounded perspective evolution between approved reflections.
              </p>
            </div>
          </div>

          <button
            id={`btn-why-seeing-diff-${diff.id}`}
            type="button"
            onClick={handleOpenProvenance}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-md transition-colors cursor-pointer shrink-0"
            title="Inspect source reflections and document relationships"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why am I seeing this?</span>
          </button>
        </div>

        {/* Earlier vs Now Stances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          {/* Earlier Snapshot Stance */}
          <div className="p-3.5 bg-white rounded-lg border border-stone-200/80 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                Earlier Stance
              </span>
              <p className="text-xs font-serif italic text-stone-800 leading-relaxed mt-1">
                "{diff.earlierPosition}"
              </p>
            </div>
          </div>

          {/* Now Snapshot Stance */}
          <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/80 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-semibold">
                  Current Stance (Now)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-800 hidden md:block" />
              </div>
              <p className="text-xs font-serif italic text-stone-900 font-medium leading-relaxed mt-1">
                "{diff.laterPosition}"
              </p>
            </div>
          </div>
        </div>

        {/* Shift and Continuity Analysis */}
        <div className="space-y-3 pt-1">
          {/* Apparent Shift */}
          <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
            <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>What Changed</span>
            </span>
            <p className="text-xs text-stone-700 leading-relaxed">
              {diff.apparentShift}
            </p>
          </div>

          {/* Apparent Continuity */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 space-y-1">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>What Stayed Consistent</span>
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              {diff.apparentContinuity}
            </p>
          </div>
        </div>

        {/* Disclaimer & Action Toolbar */}
        <div className="border-t border-stone-200/80 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>AI-generated comparison based on your approved reflections.</span>
          </div>

          {/* User Feedback Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id={`btn-diff-useful-${diff.id}`}
              type="button"
              onClick={() => handleFeedback('useful')}
              disabled={updatingStatus}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                status === 'useful' || status === 'verified'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Correct / useful</span>
            </button>

            <button
              id={`btn-diff-not-related-${diff.id}`}
              type="button"
              onClick={() => handleFeedback('not_related')}
              disabled={updatingStatus}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                status === 'not_related'
                  ? 'bg-stone-300 text-stone-900 font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <XCircle className="w-3 h-3 text-stone-500" />
              <span>Not related</span>
            </button>

            <button
              id={`btn-diff-incorrect-${diff.id}`}
              type="button"
              onClick={() => handleFeedback('incorrect_interpretation')}
              disabled={updatingStatus}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                status === 'incorrect_interpretation'
                  ? 'bg-red-100 text-red-900 border border-red-300 font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Incorrect interpretation</span>
            </button>
          </div>
        </div>

        {statusFeedbackMsg && (
          <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 animate-fade-in">
            {statusFeedbackMsg}
          </div>
        )}
      </div>

      {/* Provenance Drawer / Modal ("Why am I seeing this?") */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Why am I seeing this?
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Exact source reflections and provenance verification
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProvenanceModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingProvenance ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-stone-500 text-xs">
                <div className="w-5 h-5 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
                <span>Loading source provenance record...</span>
              </div>
            ) : provenanceError ? (
              <div className="p-4 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">
                {provenanceError}
              </div>
            ) : provenance ? (
              <div className="space-y-4 text-xs text-stone-800">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-stone-800 text-[11px] leading-relaxed">
                  MirrorTrace generated this comparison strictly by matching your own authenticated,
                  user-approved reflections on the topic <strong>"{diff.topic}"</strong>. No external data, hidden psychological assumptions, or other users' entries were accessed.
                </div>

                {/* Earlier Source Document */}
                <div className="border border-stone-200 rounded-lg p-3.5 space-y-2 bg-stone-50/60">
                  <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-stone-900">
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      Earlier Reflection Source
                    </span>
                    {provenance.earlierDate && (
                      <span className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(provenance.earlierDate).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Approved Stance:</span>
                    <p className="text-xs font-serif italic text-stone-800 bg-white p-2 rounded border border-stone-200/60">
                      "{provenance.earlierPosition}"
                    </p>
                  </div>

                  {provenance.earlierExcerpt && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">Source Excerpt:</span>
                      <p className="text-[11px] text-stone-600 font-sans leading-relaxed line-clamp-3">
                        {provenance.earlierExcerpt}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Later Source Document */}
                <div className="border border-amber-200/80 rounded-lg p-3.5 space-y-2 bg-amber-50/40">
                  <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-amber-950">
                      <FileText className="w-3.5 h-3.5 text-amber-800" />
                      Later Reflection Source
                    </span>
                    {provenance.laterDate && (
                      <span className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-amber-800" />
                        {new Date(provenance.laterDate).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-900 uppercase">Approved Stance:</span>
                    <p className="text-xs font-serif italic text-stone-900 bg-white p-2 rounded border border-amber-200/60">
                      "{provenance.laterPosition}"
                    </p>
                  </div>

                  {provenance.laterExcerpt && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-900 uppercase">Source Excerpt:</span>
                      <p className="text-[11px] text-stone-600 font-sans leading-relaxed line-clamp-3">
                        {provenance.laterExcerpt}...
                      </p>
                    </div>
                  )}
                </div>

                {/* Privacy and Non-Exposure Guarantee */}
                <div className="p-3 bg-stone-100 rounded-lg text-[10px] text-stone-500 font-mono space-y-1">
                  <div className="flex items-center gap-1 text-stone-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Provenance Integrity Guarantee</span>
                  </div>
                  <p>
                    User UID: Verified • Isolation: Owner Namespace • Zero Cross-User Visibility
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowProvenanceModal(false)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close Provenance View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
