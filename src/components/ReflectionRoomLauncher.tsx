import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Copy,
  DoorOpen,
  LogIn,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import {
  buildMirrorRoomSummary,
  closeMirrorRoom,
  createMirrorRoom,
  getMirrorRoom,
  joinMirrorRoom,
  saveMirrorRoomTakeaway,
  shareMirrorRoomContribution,
} from '../lib/reflectionRooms.ts';

import type {
  MirrorRoom,
  MirrorRoomContribution,
  MirrorRoomParticipant,
  MirrorRoomSummary,
  MirrorRoomVisibility,
} from '../types/reflectionRooms.ts';

type View =
  | 'home'
  | 'room';

export default function ReflectionRoomLauncher() {
  const [open, setOpen] =
    useState(false);

  const [view, setView] =
    useState<View>('home');

  const [room, setRoom] =
    useState<MirrorRoom | null>(null);

  const [participants, setParticipants] =
    useState<MirrorRoomParticipant[]>([]);

  const [contributions, setContributions] =
    useState<MirrorRoomContribution[]>([]);

  const [summary, setSummary] =
    useState<MirrorRoomSummary | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [prompt, setPrompt] =
    useState('');

  const [inviteCode, setInviteCode] =
    useState('');

  const [visibility, setVisibility] =
    useState<MirrorRoomVisibility>('named');

  const [displayName, setDisplayName] =
    useState('');

  const [expiryHours, setExpiryHours] =
    useState<1 | 6 | 24 | 72>(24);

  const [draft, setDraft] =
    useState('');

  const [takeaway, setTakeaway] =
    useState('');

  const canCreate =
    title.trim().length > 0 &&
    prompt.trim().length > 0;

  const canJoin =
    inviteCode.trim().length > 0;

  const inviteUrl =
    useMemo(() => {
      if (!room) return '';

      const base =
        window.location.origin +
        window.location.pathname;

      return `${base}#/mirror-room?code=${encodeURIComponent(room.inviteCode)}`;
    }, [room]);

  const refresh =
    async () => {
      if (!room) return;

      const data =
        await getMirrorRoom(
          room.id
        );

      setRoom(
        data.room
      );

      setParticipants(
        data.participants
      );

      setContributions(
        data.contributions
      );
    };

  useEffect(() => {
    if (!open || !room) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          void refresh()
            .catch(
              () => undefined
            );
        },
        5000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    open,
    room?.id,
  ]);

  const create =
    async () => {
      if (!canCreate) return;

      setBusy(true);
      setError(null);
      setCopied(false);

      try {
        const nextRoom =
          await createMirrorRoom({
            title:
              title.trim(),
            prompt:
              prompt.trim(),
            visibility,
            expiryHours,
          });

        setRoom(nextRoom);
        setView('room');

        const data =
          await getMirrorRoom(
            nextRoom.id
          );

        setParticipants(
          data.participants
        );

        setContributions(
          data.contributions
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not create Reflection Room.'
        );
      } finally {
        setBusy(false);
      }
    };

  const join =
    async () => {
      if (!canJoin) return;

      setBusy(true);
      setError(null);
      setCopied(false);

      try {
        const nextRoom =
          await joinMirrorRoom({
            inviteCode:
              inviteCode
                .trim()
                .toUpperCase(),
            visibility,
            displayName:
              displayName.trim(),
          });

        setRoom(nextRoom);
        setView('room');

        const data =
          await getMirrorRoom(
            nextRoom.id
          );

        setParticipants(
          data.participants
        );

        setContributions(
          data.contributions
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not join Reflection Room.'
        );
      } finally {
        setBusy(false);
      }
    };

  const share =
    async () => {
      if (
        !room ||
        !draft.trim()
      ) {
        return;
      }

      setBusy(true);
      setError(null);

      try {
        await shareMirrorRoomContribution({
          roomId:
            room.id,
          body:
            draft.trim(),
        });

        setDraft('');

        await refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not share this thought.'
        );
      } finally {
        setBusy(false);
      }
    };

  const buildSummary =
    async () => {
      if (!room) return;

      setBusy(true);
      setError(null);

      try {
        const nextSummary =
          await buildMirrorRoomSummary(
            room.id
          );

        setSummary(
          nextSummary
        );

        setTakeaway(
          nextSummary
            .sharedContributions
            .map(
              (
                contribution
              ) =>
                `${contribution.authorLabel}: ${contribution.body}`
            )
            .join(
              '\n\n'
            )
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not build room summary.'
        );
      } finally {
        setBusy(false);
      }
    };

  const saveTakeaway =
    async () => {
      if (
        !room ||
        !takeaway.trim()
      ) {
        return;
      }

      setBusy(true);
      setError(null);

      try {
        await saveMirrorRoomTakeaway({
          roomId:
            room.id,
          takeaway:
            takeaway.trim(),
        });

        setTakeaway('');

        alert(
          'Your takeaway was saved to your private journal. No other participant data was copied automatically.'
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not save your takeaway.'
        );
      } finally {
        setBusy(false);
      }
    };

  const copyInviteLink =
    async () => {
      if (!inviteUrl) return;

      setError(null);

      try {
        await navigator.clipboard.writeText(
          inviteUrl
        );

        setCopied(true);

        window.setTimeout(
          () => {
            setCopied(false);
          },
          2000
        );
      } catch {
        setError(
          'Could not copy the invite link.'
        );
      }
    };

  const closeRoom =
    async () => {
      if (!room) return;

      setBusy(true);
      setError(null);

      try {
        await closeMirrorRoom(
          room.id
        );

        setRoom(null);
        setParticipants([]);
        setContributions([]);
        setSummary(null);
        setDraft('');
        setTakeaway('');
        setCopied(false);
        setView('home');
        setOpen(false);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not close the room.'
        );
      } finally {
        setBusy(false);
      }
    };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="
          fixed
          bottom-20
          right-5
          z-[8500]
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-white/15
          bg-black/80
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          shadow-2xl
          transition
          hover:-translate-y-0.5
          hover:bg-black
        "
      >
        <Users className="h-4 w-4 text-amber-300" />
        MirrorRoom
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[12000] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="mx-auto min-h-screen max-w-6xl py-6">
        <section className="rounded-[32px] border border-white/10 bg-[#0b0d10] p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                MirrorTrace collaborative reasoning
              </div>

              <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
                MirrorRoom
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Think privately. Share deliberately. Compare perspectives
                without exposing anyone's journal history or reusable AI memory.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Private-by-default boundary
            </div>

            <p className="mt-1 text-xs leading-5 text-emerald-100/60">
              MirrorRoom never reads private journal entries, Thought Snapshots,
              Thought Diffs, conversations, or AI memory. Only text you explicitly
              submit with “Share this thought” enters the room.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {view === 'home' ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-amber-300" />
                  <h2 className="font-semibold">
                    Create a room
                  </h2>
                </div>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Room title"
                  className="mt-4 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                />

                <textarea
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Shared prompt, e.g. What should our team prioritise this quarter?"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                />

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select
                    value={visibility}
                    onChange={(event) =>
                      setVisibility(
                        event.target
                          .value as
                          MirrorRoomVisibility
                      )
                    }
                    className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm"
                  >
                    <option value="named">
                      Use my display name
                    </option>
                    <option value="anonymous">
                      Join anonymously
                    </option>
                  </select>

                  <select
                    value={expiryHours}
                    onChange={(event) =>
                      setExpiryHours(
                        Number(
                          event.target.value
                        ) as
                          | 1
                          | 6
                          | 24
                          | 72
                      )
                    }
                    className="rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm"
                  >
                    <option value={1}>
                      Expire in 1 hour
                    </option>
                    <option value={6}>
                      Expire in 6 hours
                    </option>
                    <option value={24}>
                      Expire in 24 hours
                    </option>
                    <option value={72}>
                      Expire in 72 hours
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={
                    busy ||
                    !canCreate
                  }
                  onClick={() =>
                    void create()
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <DoorOpen className="h-4 w-4" />
                  Create MirrorRoom
                </button>
              </article>

              <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-sky-300" />
                  <h2 className="font-semibold">
                    Join with a code
                  </h2>
                </div>

                <input
                  value={inviteCode}
                  onChange={(event) =>
                    setInviteCode(
                      event.target.value
                    )
                  }
                  placeholder="Invite code"
                  className="mt-4 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm uppercase text-white"
                />

                <input
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value
                    )
                  }
                  placeholder="Optional room display name"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                />

                <select
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(
                      event.target
                        .value as
                        MirrorRoomVisibility
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm"
                >
                  <option value="named">
                    Show display name
                  </option>
                  <option value="anonymous">
                    Join anonymously
                  </option>
                </select>

                <button
                  type="button"
                  disabled={
                    busy ||
                    !canJoin
                  }
                  onClick={() =>
                    void join()
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <LogIn className="h-4 w-4" />
                  Join room
                </button>
              </article>
            </div>
          ) : room ? (
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                    {room.status}
                  </div>

                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    {room.title}
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
                    {room.prompt}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <span>
                      Code: {room.inviteCode}
                    </span>
                    <span>
                      •
                    </span>
                    <span>
                      {participants.length} participant{participants.length === 1 ? '' : 's'}
                    </span>
                    <span>
                      •
                    </span>
                    <span>
                      Expires {new Date(room.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void copyInviteLink()
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied
                      ? 'Copied!'
                      : 'Copy invite link'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void refresh()
                    }
                    className="rounded-xl border border-white/10 bg-white/5 p-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void closeRoom()
                    }
                    className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-40"
                  >
                    Close room
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
                <article className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="font-semibold">
                    Share this thought
                  </h3>

                  <p className="mt-1 text-xs text-white/50">
                    Nothing is shared until you press the button below.
                  </p>

                  <textarea
                    value={draft}
                    onChange={(event) =>
                      setDraft(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Write privately here first. Share only when ready."
                    className="mt-4 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                  />

                  <button
                    type="button"
                    disabled={
                      busy ||
                      !draft.trim()
                    }
                    onClick={() =>
                      void share()
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    Share this thought
                  </button>

                  <div className="mt-6 space-y-3">
                    {contributions.map(
                      (
                        contribution
                      ) => (
                        <div
                          key={
                            contribution.id
                          }
                          className="rounded-2xl border border-white/10 bg-black/45 p-4"
                        >
                          <div className="text-[11px] font-semibold text-amber-200">
                            {contribution.authorLabel}
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
                            {contribution.body}
                          </p>

                          <div className="mt-2 text-[10px] text-white/35">
                            {new Date(
                              contribution.createdAt
                            ).toLocaleString()}
                          </div>
                        </div>
                      )
                    )}

                    {contributions.length ===
                      0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
                        Nothing has been deliberately shared yet.
                      </div>
                    )}
                  </div>
                </article>

                <aside className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-300" />
                      <h3 className="font-semibold">
                        Participants
                      </h3>
                    </div>

                    <div className="mt-3 space-y-2">
                      {participants.map(
                        (
                          participant
                        ) => (
                          <div
                            key={
                              participant.id
                            }
                            className="rounded-xl bg-black/40 px-3 py-2 text-xs text-white/65"
                          >
                            {participant.displayName}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <h3 className="font-semibold">
                        Shared summary
                      </h3>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-white/50">
                      This safe default summary uses only explicitly shared room content
                      and does not call Gemini.
                    </p>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void buildSummary()
                      }
                      className="mt-3 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100"
                    >
                      Build factual room summary
                    </button>

                    {summary && (
                      <div className="mt-4 rounded-xl bg-black/45 p-3 text-xs text-white/60">
                        {summary.participantCount} participants ·{' '}
                        {summary.contributionCount} shared contributions
                      </div>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
                    <h3 className="font-semibold">
                      Save only my takeaway
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-white/50">
                      This creates a private journal entry under your own UID.
                    </p>

                    <textarea
                      value={takeaway}
                      onChange={(event) =>
                        setTakeaway(
                          event.target.value
                        )
                      }
                      rows={5}
                      placeholder="Write the takeaway you personally want to keep..."
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                    />

                    <button
                      type="button"
                      disabled={
                        busy ||
                        !takeaway.trim()
                      }
                      onClick={() =>
                        void saveTakeaway()
                      }
                      className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-40"
                    >
                      Save to my private journal
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
