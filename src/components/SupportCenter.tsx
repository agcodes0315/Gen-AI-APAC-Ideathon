import { useEffect, useState } from 'react';
import {
  createSupportTicket,
  getMySupportTickets,
  type SupportTicket,
} from '../lib/supportReviews.ts';

export default function SupportCenter() {
  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setTickets(await getMySupportTickets().catch(() => []));
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please add a subject and message.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await createSupportTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubject('');
      setMessage('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ticket failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Customer Support
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          MirrorTrace never attaches journal or AI conversation content automatically.
        </p>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-5 w-full rounded-xl border border-stone-300 px-3 py-2"
        >
          <option value="account_login">Account / Login</option>
          <option value="notifications">Notifications</option>
          <option value="ai_output">AI Output</option>
          <option value="memory_provenance">Memory / Provenance</option>
          <option value="bug">Bug</option>
          <option value="feature_request">Feature Request</option>
          <option value="privacy_concern">Privacy Concern</option>
          <option value="other">Other</option>
        </select>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={160}
          placeholder="Subject"
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Describe the issue."
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2"
        />

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-3 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Submitting…' : 'Submit support ticket'}
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-stone-900">Your Tickets</h3>

        <div className="mt-4 space-y-3">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex justify-between gap-3">
                <strong>{ticket.subject}</strong>
                <span className="text-xs text-stone-500">{ticket.status}</span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">
                {ticket.message}
              </p>

              {ticket.adminReply && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-bold text-amber-800">
                    MirrorTrace Support
                  </div>
                  <p className="mt-1 text-sm text-amber-900">
                    {ticket.adminReply}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
