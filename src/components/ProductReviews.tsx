import { useEffect, useState } from 'react';
import {
  createReview,
  getMyReviews,
  getPublicReviews,
  type ProductReview,
} from '../lib/supportReviews.ts';

export default function ProductReviews() {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [allowPublic, setAllowPublic] = useState(false);
  const [mine, setMine] = useState<ProductReview[]>([]);
  const [publicReviews, setPublicReviews] = useState<ProductReview[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [my, pub] = await Promise.all([
      getMyReviews().catch(() => []),
      getPublicReviews().catch(() => []),
    ]);

    setMine(my);
    setPublicReviews(pub);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!reviewText.trim()) return;

    setBusy(true);

    try {
      await createReview({
        rating,
        reviewText: reviewText.trim(),
        allowPublic,
      });

      setReviewText('');
      setAllowPublic(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Product Feedback
        </h2>

        <div className="mt-4 flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={n <= rating ? 'text-2xl text-amber-600' : 'text-2xl text-stone-300'}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="What worked well? What should improve?"
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        <label className="mt-3 flex gap-3 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={allowPublic}
            onChange={(e) => setAllowPublic(e.target.checked)}
          />
          Allow public display after admin moderation.
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-3 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Submit review
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Your Reviews</h3>
          <div className="mt-4 space-y-3">
            {mine.map((r) => (
              <article key={r.id} className="rounded-xl border border-stone-200 p-4">
                <div className="text-amber-600">{'★'.repeat(r.rating)}</div>
                <p className="mt-2 text-sm">{r.reviewText}</p>
                <div className="mt-2 text-xs text-stone-500">{r.moderationState}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Community Feedback</h3>
          <div className="mt-4 space-y-3">
            {publicReviews.map((r) => (
              <article key={r.id} className="rounded-xl border border-stone-200 p-4">
                <div className="text-amber-600">{'★'.repeat(r.rating)}</div>
                <p className="mt-2 text-sm">{r.reviewText}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
