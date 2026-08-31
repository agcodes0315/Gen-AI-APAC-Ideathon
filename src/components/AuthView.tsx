import '../styles/mirrortrace-clean-glass.css';
import '../styles/mirrortrace-authenticated-haze.css';
import '../styles/mirrortrace-motion-and-glass.css';
import '../styles/mirrortrace-hero-darken.css';
import '../styles/mirrortrace-scroll-performance.css';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowRight,
  BellRing,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  EyeOff,
  GitCompare,
  Lock,
  Menu,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

import {
  motion,
  useReducedMotion,
} from 'motion/react';

import ScrollArcCard from './ScrollArcCard.tsx';

import {
  signInWithGoogle,
} from '../lib/firebase.ts';

import {
  getPublicReviews,
  type ProductReview,
} from '../lib/supportReviews.ts';

import '../mirrortrace-motion.css';

interface AuthViewProps {
  onSuccess?: () => void;
}

type FeatureCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'amber' | 'emerald' | 'blue' | 'violet' | 'stone';
};

const HERO_VIDEO = '/hero/mirrortrace-hero.mp4';
const HERO_POSTER = '/hero/mirrortrace-poster.jpeg';

const TOP_ROW: FeatureCard[] = [
  {
    id: 'reflect',
    eyebrow: 'Reflection',
    title: 'Write naturally',
    body: 'Capture a thought in your own words, with Gemini available only as a companion.',
    icon: BookOpen,
    accent: 'amber',
  },
  {
    id: 'memory',
    eyebrow: 'AI Memory',
    title: 'Approve what persists',
    body: 'Suggested Thought Snapshots stay pending until you explicitly approve them.',
    icon: Sparkles,
    accent: 'violet',
  },
  {
    id: 'diff',
    eyebrow: 'Perspective',
    title: 'See what changed',
    body: 'Thought Diffs compare approved positions and preserve the evidence behind the shift.',
    icon: GitCompare,
    accent: 'blue',
  },
  {
    id: 'private',
    eyebrow: 'Private Session',
    title: 'Reflect without persistence',
    body: 'Use an ephemeral space when you want no journal history, memory, or future comparison.',
    icon: EyeOff,
    accent: 'stone',
  },
  {
    id: 'watch',
    eyebrow: 'Perspective Watch',
    title: 'Revisit later',
    body: 'Schedule a future check-in and receive an optional reminder when it is time to reflect again.',
    icon: Clock3,
    accent: 'emerald',
  },
];

const BOTTOM_ROW: FeatureCard[] = [
  {
    id: 'provenance',
    eyebrow: 'Provenance',
    title: 'Ask "why am I seeing this?"',
    body: 'Trace a generated comparison back to the exact authenticated reflections that support it.',
    icon: ShieldCheck,
    accent: 'emerald',
  },
  {
    id: 'support',
    eyebrow: 'Support',
    title: 'Ask for help safely',
    body: 'Support receives only the text you intentionally submit, never your private journal automatically.',
    icon: MessagesSquare,
    accent: 'blue',
  },
  {
    id: 'notifications',
    eyebrow: 'Notifications',
    title: 'Stay on schedule',
    body: 'Perspective Watch can deliver browser push and email reminders through your configured preferences.',
    icon: BellRing,
    accent: 'amber',
  },
  {
    id: 'governance',
    eyebrow: 'Memory Governance',
    title: 'Review and revoke',
    body: 'Inspect approved memories, retention, watches, export, and revocation from one control center.',
    icon: Database,
    accent: 'violet',
  },
  {
    id: 'security',
    eyebrow: 'Security',
    title: 'Owner-bound by design',
    body: 'Private application data remains scoped to the authenticated Firebase UID.',
    icon: Lock,
    accent: 'stone',
  },
];

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
);

function getAccentClasses(accent: FeatureCard['accent']): {
  icon: string;
  chip: string;
} {
  switch (accent) {
    case 'emerald':
      return { icon: 'bg-emerald-500/15 text-emerald-200', chip: 'text-emerald-300' };
    case 'blue':
      return { icon: 'bg-blue-500/15 text-blue-200', chip: 'text-blue-300' };
    case 'violet':
      return { icon: 'bg-violet-500/15 text-violet-200', chip: 'text-violet-300' };
    case 'stone':
      return { icon: 'bg-stone-400/15 text-stone-200', chip: 'text-stone-300' };
    default:
      return { icon: 'bg-amber-500/15 text-amber-200', chip: 'text-amber-300' };
  }
}

function FeatureCardView({
  card,
  index,
  total,
  direction,
}: {
  card: FeatureCard;
  index: number;
  total: number;
  direction: 'left' | 'right';
}) {
  const Icon = card.icon;
  const classes = getAccentClasses(card.accent);

  return (
    <ScrollArcCard
      className="mirrortrace-scroll-card"
      direction={direction}
      index={index}
      total={total}
    >
      <div className="flex items-start justify-between gap-5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${classes.icon}`}>
          <Icon className="h-5 w-5" />
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${classes.chip}`}>
          {card.eyebrow}
        </span>
      </div>

      <h3 className="mt-5 font-serif text-xl font-bold tracking-tight">{card.title}</h3>

      <p className="mt-3 text-sm leading-6 text-stone-300">{card.body}</p>

      <div className="mt-6 flex items-center gap-1 text-[11px] font-semibold text-stone-400">
        MirrorTrace
        <ArrowRight className="h-3 w-3" />
      </div>
    </ScrollArcCard>
  );
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const reducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    void getPublicReviews()
      .then(setReviews)
      .catch(() => {
        setReviews([]);
      });
  }, []);

  const reviewLoop = useMemo(() => [...reviews, ...reviews], [reviews]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      await signInWithGoogle();

      onSuccess?.();
    } catch (err: unknown) {
      console.error('Sign-in error:', err);

      setError('Unable to complete Google sign-in. Please allow popups and try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="mirrortrace-auth-page mirrortrace-single-background min-h-screen text-white">
      <section id="hero" className="relative min-h-screen overflow-hidden bg-stone-950">
        {/* Hue-matched hazy overlay — same recipe as the card system
            (.mt-glass) so the hero reads as part of the same visual
            family instead of a separate, brighter photo. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, hsl(205 40% 6% / 0.90) 0%, hsl(205 32% 8% / 0.78) 42%, hsl(205 26% 9% / 0.62) 70%, hsl(205 22% 10% / 0.5) 100%)',
          }}
        />

        <video
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          style={{ filter: 'blur(1.5px) saturate(0.85) brightness(0.72)' }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stone-950 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <div className="sticky top-0 z-30 pt-4 sm:pt-6">
            <div className="mirrortrace-liquid-nav mirrortrace-landing-nav mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="mirrortrace-nav-brand flex items-center gap-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-stone-950">
                  <span className="font-serif text-lg font-bold">M</span>
                </div>

                <div className="hidden text-left sm:block">
                  <div className="font-serif text-lg font-bold">MirrorTrace</div>
                  <div className="text-[10px] text-white/50">
                    Version control for your thinking
                  </div>
                </div>
              </button>

              <nav className="mirrortrace-nav-links hidden items-center gap-8 md:flex">
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="text-xs font-medium text-white/65 transition-colors hover:text-white"
                >
                  Features
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('security')}
                  className="text-xs font-medium text-white/65 transition-colors hover:text-white"
                >
                  Security
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('reviews')}
                  className="text-xs font-medium text-white/65 transition-colors hover:text-white"
                >
                  Reviews
                </button>
              </nav>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="mirrortrace-nav-cta hidden rounded-full px-5 py-2.5 text-xs font-semibold md:block"
              >
                Continue with Google
              </button>

              <button
                type="button"
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((current) => !current)}
                className="mirrortrace-nav-menu grid h-9 w-9 place-items-center rounded-full md:hidden"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

            {mobileOpen && (
              <div className="mirrortrace-liquid-panel mirrortrace-mobile-nav mx-auto mt-3 max-w-6xl rounded-3xl p-4 md:hidden">
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="rounded-xl px-3 py-3 text-left text-sm text-white/80 hover:bg-white/10"
                  >
                    Features
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('security')}
                    className="rounded-xl px-3 py-3 text-left text-sm text-white/80 hover:bg-white/10"
                  >
                    Security
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('reviews')}
                    className="rounded-xl px-3 py-3 text-left text-sm text-white/80 hover:bg-white/10"
                  >
                    Reviews
                  </button>

                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-950"
                  >
                    Continue with Google
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              <div className="mirrortrace-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/75">
                <GitCompare className="h-3.5 w-3.5 text-amber-300" />
                Evidence-first AI reflection
              </div>

              <h1 className="mt-7 max-w-4xl font-serif text-5xl font-bold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                See how your
                <span className="block text-amber-200">thinking evolves.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                MirrorTrace helps you revisit ideas over time without letting AI silently decide what you believe.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
                You decide what becomes reusable memory. Every future comparison remains traceable to the reflections that produced it.
              </p>

              {error && (
                <div className="mt-glass mt-glass-plain mt-5 flex max-w-xl items-start gap-2 rounded-2xl border-red-400/20 p-3 text-xs text-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <motion.button
                  type="button"
                  whileHover={reducedMotion ? undefined : { y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignIn}
                  disabled={loading}
                  className="mt-hover-pop inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 shadow-2xl disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
                  ) : (
                    <GoogleIcon />
                  )}

                  <span>{loading ? 'Connecting…' : 'Continue with Google'}</span>

                  {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>

                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="mt-hover-pop rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                >
                  Explore MirrorTrace
                </button>
              </div>
            </motion.div>
          </div>

          <div className="pb-7 text-center text-[10px] text-white/30">
            Firebase Authentication • Owner-bound UID isolation • Server-side Gemini
          </div>
        </div>
      </section>

      {/* ======================================================
          HYBRID SCROLL + BROWSE FEATURE SHOWCASE
          ====================================================== */}

      <section
        id="features"
        className="mirrortrace-feature-section mirrortrace-unified-section mirrortrace-section-glass"
      >
        <motion.div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--mt-accent)]">
              Built around your decisions
            </div>

            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[var(--mt-text)] sm:text-5xl lg:text-6xl">
              Reflection that moves with you.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--mt-text-muted)]">
              Scroll naturally through the page. Each card enters with a soft curved motion, while every row remains freely browsable left or right with a trackpad, swipe, or the arrow controls.
            </p>
          </motion.div>
        </motion.div>

        <div className="mirrortrace-feature-shell mx-auto mt-11 max-w-[1600px]">
          <div className="mirrortrace-lane-heading">
            <span>Core reflection flow</span>
            <span className="mirrortrace-browse-hint">Browse left / right</span>
          </div>

          <div className="mirrortrace-lane-wrap">
            <button
              type="button"
              aria-label="Scroll top feature row left"
              className="mirrortrace-lane-arrow mirrortrace-lane-arrow-left"
              onClick={(event) => {
                const lane = event.currentTarget.parentElement?.querySelector(
                  '.mirrortrace-card-lane'
                ) as HTMLElement | null;

                lane?.scrollBy({ left: -380, behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              ‹
            </button>

            <div className="mirrortrace-card-lane">
              <div className="mirrortrace-scroll-row">
                {TOP_ROW.map((card, i) => (
                  <FeatureCardView
                    key={card.id}
                    card={card}
                    index={i}
                    total={TOP_ROW.length}
                    direction="left"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Scroll top feature row right"
              className="mirrortrace-lane-arrow mirrortrace-lane-arrow-right"
              onClick={(event) => {
                const lane = event.currentTarget.parentElement?.querySelector(
                  '.mirrortrace-card-lane'
                ) as HTMLElement | null;

                lane?.scrollBy({ left: 380, behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              ›
            </button>
          </div>

          <div className="mirrortrace-lane-heading mt-8">
            <span>Control, safety & follow-up</span>
            <span className="mirrortrace-browse-hint">Browse left / right</span>
          </div>

          <div className="mirrortrace-lane-wrap">
            <button
              type="button"
              aria-label="Scroll bottom feature row left"
              className="mirrortrace-lane-arrow mirrortrace-lane-arrow-left"
              onClick={(event) => {
                const lane = event.currentTarget.parentElement?.querySelector(
                  '.mirrortrace-card-lane'
                ) as HTMLElement | null;

                lane?.scrollBy({ left: -380, behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              ‹
            </button>

            <div className="mirrortrace-card-lane">
              <div className="mirrortrace-scroll-row">
                {BOTTOM_ROW.map((card, i) => (
                  <FeatureCardView
                    key={card.id}
                    card={card}
                    index={i}
                    total={BOTTOM_ROW.length}
                    direction="right"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Scroll bottom feature row right"
              className="mirrortrace-lane-arrow mirrortrace-lane-arrow-right"
              onClick={(event) => {
                const lane = event.currentTarget.parentElement?.querySelector(
                  '.mirrortrace-card-lane'
                ) as HTMLElement | null;

                lane?.scrollBy({ left: 380, behavior: reducedMotion ? 'auto' : 'smooth' });
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="mirrortrace-summary-pill">
              <CheckCircle2 className="h-4 w-4 text-[var(--mt-success)]" />
              <span>Consent-bound memory</span>
            </div>

            <div className="mirrortrace-summary-pill">
              <RefreshCcw className="h-4 w-4 text-[var(--mt-accent)]" />
              <span>Evidence-backed change</span>
            </div>

            <div className="mirrortrace-summary-pill">
              <ShieldCheck className="h-4 w-4 text-[var(--mt-accent-strong)]" />
              <span>Owner-isolated by design</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="security"
        className="mirrortrace-unified-section mirrortrace-security-clean px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: reducedMotion ? 0 : -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Security by architecture
            </div>

            <h2 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Admins operate the system without becoming readers of your private memory.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
              MirrorTrace separates operational administration from journal content, conversations, approved memories, Thought Diffs, and provenance.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: 'Owner-bound UID isolation',
                body: 'Private journal data remains scoped to the authenticated Firebase UID.',
              },
              {
                icon: Lock,
                title: 'No password collection',
                body: 'Authentication is handled through Firebase Google Sign-In.',
              },
              {
                icon: CheckCircle2,
                title: 'Consent-bound AI memory',
                body: 'Unapproved interpretations never become persistent Thought Snapshots.',
              },
              {
                icon: GitCompare,
                title: 'Inspectable provenance',
                body: 'Thought Diffs remain traceable back to the source reflections that produced them.',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-glass mt-glass-cool mt-hover-pop rounded-[26px] p-5"
                >
                  <Icon className="h-5 w-5 text-amber-200" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-stone-300">{item.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="reviews"
        className="mirrortrace-unified-section overflow-hidden py-20 text-white sm:py-24 mirrortrace-reviews-clean"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
            Public reviews
          </div>

          <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            Feedback shared by choice.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-500">
            Reviews appear here only when the user explicitly allows public display and an administrator approves the submission.
          </p>
        </div>

        <div className="mt-12 overflow-hidden">
          {reviews.length > 0 ? (
            <div className="mirrortrace-review-stage">
              <div className="mirrortrace-review-track">
                {reviewLoop.map((review, index) => (
                  <article key={`${review.id}-${index}`} className="mirrortrace-review-card">
                    <div className="text-xl tracking-wider text-orange-400">
                      {'★'.repeat(Math.max(1, Math.min(5, review.rating)))}
                    </div>

                    <p className="mt-5 min-h-[110px] text-base leading-7 text-stone-600">
                      {review.reviewText}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="text-xs text-stone-400">MirrorTrace user</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                        Approved
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl px-4 sm:px-6">
              <div className="rounded-[28px] border border-dashed border-indigo-200 bg-white/70 p-8 text-center">
                <Star className="mx-auto h-5 w-5 text-indigo-400" />
                <div className="mt-3 text-sm font-semibold text-stone-700">
                  No public reviews yet.
                </div>
                <p className="mt-2 text-xs leading-6 text-stone-500">
                  The first review will appear only after explicit public consent and admin approval.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={handleSignIn}
            className="inline-flex items-center gap-3 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
          >
            <GoogleIcon />
            Start reflecting
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};