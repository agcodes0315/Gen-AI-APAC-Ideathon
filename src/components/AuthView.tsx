import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  GitCompare,
  EyeOff,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

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

      setError(
        'Unable to complete Google sign-in. Please allow popups and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left: Product Story */}
        <section className="relative overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200 bg-[#fffdf8]">
          {/* Decorative background */}
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-10 lg:py-16 min-h-full flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-sm">
                <span className="font-serif font-bold text-xl">M</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl font-bold text-stone-950">
                    MirrorTrace
                  </h1>

                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                    <ShieldCheck className="w-3 h-3" />
                    Isolated UID
                  </span>
                </div>

                <p className="text-[11px] text-stone-500">
                  Version control for your thinking
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="mt-14 lg:mt-20 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950">
                <GitCompare className="w-3.5 h-3.5" />
                Evidence-first AI reflection
              </span>

              <h2 className="mt-5 font-serif text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.04] text-stone-950">
                See how your
                <span className="block text-amber-900">
                  thinking evolves.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-stone-600">
                MirrorTrace helps you revisit ideas over time without letting
                AI silently decide what you believe.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-500">
                Gemini may propose an interpretation. You decide whether it
                becomes memory. Any future perspective change remains traceable
                to the reflections that produced it.
              </p>
            </div>

            {/* Value blocks */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>

                <h3 className="mt-3 font-serif text-sm font-bold text-stone-950">
                  Consent-bound memory
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600">
                  AI interpretations become persistent only after you approve
                  them.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                  <GitCompare className="w-4 h-4" />
                </div>

                <h3 className="mt-3 font-serif text-sm font-bold text-stone-950">
                  Thought Diffs
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600">
                  Compare approved positions and see what changed or stayed
                  consistent.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center">
                  <EyeOff className="w-4 h-4" />
                </div>

                <h3 className="mt-3 font-serif text-sm font-bold text-stone-950">
                  Private by design
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600">
                  Private Sessions never enter journal history or future AI
                  memory.
                </p>
              </div>
            </div>

            {/* Mini diff preview */}
            <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-amber-900" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950">
                    Thought Diff Preview
                  </span>
                </div>

                <span className="rounded-full bg-white border border-amber-200 px-2.5 py-1 text-[9px] font-semibold text-amber-900">
                  Evidence-backed
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="rounded-xl border border-stone-200 bg-white p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-stone-500">
                    Earlier
                  </p>

                  <p className="mt-2 font-serif text-xs italic leading-relaxed text-stone-700">
                    “I’m still deciding which path makes sense.”
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0 text-amber-800" />
                </div>

                <div className="rounded-xl border border-amber-300 bg-white p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-amber-900">
                    Current
                  </p>

                  <p className="mt-2 font-serif text-xs italic leading-relaxed text-stone-900">
                    “I now prefer gaining practical experience first.”
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <p className="text-[10px] text-stone-400">
                Built with Google AI Studio, Firebase Authentication, Cloud
                Firestore, and server-side Gemini.
              </p>
            </div>
          </div>
        </section>

        {/* Right: Sign-in */}
        <section className="bg-stone-100 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-[26px] border border-stone-200 shadow-sm p-6 sm:p-8">
              <div>
                <div className="w-11 h-11 rounded-xl bg-stone-950 text-white flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>

                <h2 className="mt-5 font-serif text-2xl font-bold text-stone-950">
                  Your private thinking space
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Sign in securely to access your personal reflection archive,
                  approved Thought Snapshots, and evidence-backed Thought
                  Diffs.
                </p>
              </div>

              {error && (
                <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="btn-google-signin"
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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

                <span>
                  {loading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>

                {!loading && (
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                )}
              </button>

              <p className="mt-3 text-center text-[10px] leading-relaxed text-stone-400">
                Authentication is handled through Firebase Google Sign-In.
                MirrorTrace does not collect or store your password.
              </p>

              {/* Trust list */}
              <div className="mt-7 border-t border-stone-100 pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Owner-bound isolation
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                      Your journal data is scoped to your authenticated Firebase
                      UID.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-amber-800" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      You approve AI memory
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                      Gemini cannot silently turn an interpretation into a
                      persistent Thought Snapshot.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-stone-700" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Evidence remains inspectable
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                      Thought Diffs retain provenance back to their source
                      reflections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-xl bg-stone-950 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

                  <p className="text-[11px] leading-relaxed text-stone-300">
                    <span className="font-semibold text-white">
                      MirrorTrace does not profile you.
                    </span>{' '}
                    It compares only the reflection interpretations you
                    explicitly approve.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] text-stone-400">
              Evidence-first reflection • User-controlled memory • Secure
              identity isolation
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};