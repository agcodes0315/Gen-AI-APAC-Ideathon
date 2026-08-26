import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase.ts';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      setError('Unable to complete Google sign-in. Please ensure popups are permitted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-amber-800 rounded-2xl mx-auto flex items-center justify-center text-amber-50 shadow-md">
            <span className="font-serif font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
            MirrorTrace
          </h1>
          <p className="text-sm text-stone-600 font-sans leading-relaxed max-w-sm mx-auto">
            A secure, evidence-first AI journaling space with owner-bound isolation and thoughtful conversation.
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white p-8 rounded-xl shadow-xs border border-stone-200 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="btn-google-signin"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
            )}
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            {!loading && <ArrowRight className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Architectural Security Highlights */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Owner-Bound Data Isolation</strong>: Your journals and chats are stored strictly under your verified UID.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Server-Side Secret Protection</strong>: Gemini API keys are never sent to or stored in your browser.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-stone-600">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Interpretation Consent</strong>: Reflections remain your own; AI insights require your explicit approval.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-stone-500 font-sans">
          Built with Google AI Studio • Designed for the Google Gen AI Ideathon
        </p>
      </div>
    </div>
  );
};
