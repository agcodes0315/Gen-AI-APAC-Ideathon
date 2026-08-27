import { getCurrentIdToken } from './firebase.ts';

import type {
  JournalEntry,
  Conversation,
  ConversationMessage,
  BrainstormResponse,
  ThoughtSnapshot,
  ThoughtSnapshotProposal,
  ApproveSnapshotPayload,
  ThoughtDiff,
  ThoughtDiffProvenance,
  GenerateDiffResponse,
  DiffRelationshipStatus,
} from '../types.ts';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Authenticated request helper.
 */
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getCurrentIdToken();

  if (!token) {
    throw new ApiError(
      'Not authenticated. Please sign in.',
      401,
      'AUTH_REQUIRED'
    );
  }

  const headers = new Headers(
    options.headers || {}
  );

  headers.set(
    'Authorization',
    `Bearer ${token}`
  );

  if (
    options.body &&
    typeof options.body === 'string'
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res
    .json()
    .catch(() => ({}));

  if (!res.ok) {
    const payload =
      data &&
      typeof data === 'object'
        ? (data as Record<string, unknown>)
        : {};

    throw new ApiError(
      String(
        payload.message ||
          payload.error ||
          `Request failed with status ${res.status}`
      ),
      res.status,
      typeof payload.code === 'string'
        ? payload.code
        : undefined
    );
  }

  return data as T;
}

/**
 * Runtime validation for JournalEntry.
 *
 * This keeps the UI from attempting:
 *
 * journal.id
 *
 * when an unexpected/malformed response reaches
 * the browser.
 */
function isJournalEntry(
  value: unknown
): value is JournalEntry {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const candidate =
    value as Partial<JournalEntry>;

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.content === 'string'
  );
}

/**
 * Compare journal contents to recover an entry
 * that was successfully persisted even if the POST
 * response shape was unexpectedly malformed.
 */
function findMatchingJournal(
  entries: JournalEntry[],
  content: string
): JournalEntry | undefined {
  const normalizedContent =
    content.trim();

  return entries.find(
    (entry) =>
      typeof entry?.content === 'string' &&
      entry.content.trim() ===
        normalizedContent
  );
}

/* ============================================================
   JOURNAL API
   ============================================================ */

export async function createJournalEntry(
  content: string,
  tags: string[]
): Promise<{
  journal: JournalEntry;
}> {
  /**
   * `entry` is included only as a compatibility
   * fallback in case an older preview runtime returns
   * a differently named field.
   */
  const data = await fetchWithAuth<{
    success?: boolean;
    journal?: JournalEntry;
    entry?: JournalEntry;
  }>('/api/journal', {
    method: 'POST',
    body: JSON.stringify({
      content,
      tags,
    }),
  });

  /**
   * Normal expected backend response.
   */
  if (isJournalEntry(data.journal)) {
    return {
      journal: data.journal,
    };
  }

  /**
   * Compatibility fallback.
   */
  if (isJournalEntry(data.entry)) {
    console.warn(
      '[MirrorTrace] Journal API returned `entry` instead of `journal`. Using compatibility fallback.'
    );

    return {
      journal: data.entry,
    };
  }

  /**
   * IMPORTANT:
   * The write may already have succeeded even though
   * the response object is malformed.
   *
   * Instead of telling the user to retry and creating
   * a duplicate, fetch the canonical journal list and
   * recover the newly saved record.
   */
  console.warn(
    '[MirrorTrace] Journal POST response did not contain a valid journal object. Attempting canonical recovery.'
  );

  try {
    const recovered =
      await fetchWithAuth<{
        entries: JournalEntry[];
      }>('/api/journal', {
        method: 'GET',
      });

    const entries =
      Array.isArray(recovered.entries)
        ? recovered.entries
        : [];

    const matchingEntry =
      findMatchingJournal(
        entries,
        content
      );

    if (
      matchingEntry &&
      isJournalEntry(matchingEntry)
    ) {
      console.warn(
        '[MirrorTrace] Recovered successfully persisted journal entry from canonical history.'
      );

      return {
        journal: matchingEntry,
      };
    }
  } catch (recoveryError) {
    console.error(
      '[MirrorTrace] Journal recovery request failed:',
      recoveryError
    );
  }

  throw new ApiError(
    'The reflection may have been saved, but MirrorTrace could not confirm the saved journal record. Check Journal History before trying again.',
    500,
    'INVALID_JOURNAL_RESPONSE'
  );
}

export async function fetchJournalEntries(): Promise<
  JournalEntry[]
> {
  const data =
    await fetchWithAuth<{
      entries: JournalEntry[];
    }>('/api/journal', {
      method: 'GET',
    });

  return Array.isArray(data.entries)
    ? data.entries
    : [];
}

export async function deleteJournalEntry(
  id: string
): Promise<void> {
  await fetchWithAuth<{
    success: boolean;
  }>(`/api/journal/${id}`, {
    method: 'DELETE',
  });
}

/* ============================================================
   CONVERSATION API
   ============================================================ */

export async function createConversation(
  title?: string,
  journalId?: string
): Promise<{
  conversationId: string;
}> {
  return fetchWithAuth<{
    conversationId: string;
  }>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({
      title,
      journalId,
    }),
  });
}

export async function fetchConversations(): Promise<
  Conversation[]
> {
  const data =
    await fetchWithAuth<{
      conversations: Conversation[];
    }>('/api/conversations', {
      method: 'GET',
    });

  return Array.isArray(
    data.conversations
  )
    ? data.conversations
    : [];
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const data =
    await fetchWithAuth<{
      messages: ConversationMessage[];
    }>(
      `/api/conversations/${conversationId}/messages`,
      {
        method: 'GET',
      }
    );

  return Array.isArray(data.messages)
    ? data.messages
    : [];
}

export async function sendConversationMessage(
  conversationId: string,
  message: string
): Promise<BrainstormResponse> {
  return fetchWithAuth<BrainstormResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
      }),
    }
  );
}

/* ============================================================
   THOUGHT SNAPSHOT API
   ============================================================ */

export async function proposeThoughtSnapshot(
  journalId: string
): Promise<{
  success: boolean;
  proposal: ThoughtSnapshotProposal;
  modelUsed?: string;
}> {
  if (
    !journalId ||
    typeof journalId !== 'string'
  ) {
    throw new ApiError(
      'Cannot generate a Thought Snapshot because the journal ID is missing.',
      400,
      'JOURNAL_ID_REQUIRED'
    );
  }

  return fetchWithAuth<{
    success: boolean;
    proposal: ThoughtSnapshotProposal;
    modelUsed?: string;
  }>(
    '/api/thought-snapshots/propose',
    {
      method: 'POST',
      body: JSON.stringify({
        journalId,
      }),
    }
  );
}

export async function approveThoughtSnapshot(
  payload: ApproveSnapshotPayload
): Promise<{
  success: boolean;
  snapshot: ThoughtSnapshot;
}> {
  return fetchWithAuth<{
    success: boolean;
    snapshot: ThoughtSnapshot;
  }>(
    '/api/thought-snapshots/approve',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchThoughtSnapshots(): Promise<
  ThoughtSnapshot[]
> {
  const data =
    await fetchWithAuth<{
      snapshots: ThoughtSnapshot[];
    }>('/api/thought-snapshots', {
      method: 'GET',
    });

  return Array.isArray(data.snapshots)
    ? data.snapshots
    : [];
}

export async function deleteThoughtSnapshot(
  id: string
): Promise<void> {
  await fetchWithAuth<{
    success: boolean;
  }>(
    `/api/thought-snapshots/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/* ============================================================
   THOUGHT DIFF API
   ============================================================ */

export async function generateThoughtDiff(
  snapshotId: string
): Promise<GenerateDiffResponse> {
  if (
    !snapshotId ||
    typeof snapshotId !== 'string'
  ) {
    throw new ApiError(
      'Cannot evaluate a Thought Diff because the snapshot ID is missing.',
      400,
      'SNAPSHOT_ID_REQUIRED'
    );
  }

  return fetchWithAuth<GenerateDiffResponse>(
    '/api/thought-diffs/generate',
    {
      method: 'POST',
      body: JSON.stringify({
        snapshotId,
      }),
    }
  );
}

export async function fetchThoughtDiffs(): Promise<
  ThoughtDiff[]
> {
  const data =
    await fetchWithAuth<{
      diffs: ThoughtDiff[];
    }>('/api/thought-diffs', {
      method: 'GET',
    });

  return Array.isArray(data.diffs)
    ? data.diffs
    : [];
}

export async function fetchDiffProvenance(
  diffId: string
): Promise<ThoughtDiffProvenance> {
  const data =
    await fetchWithAuth<{
      provenance: ThoughtDiffProvenance;
    }>(
      `/api/thought-diffs/${diffId}/provenance`,
      {
        method: 'GET',
      }
    );

  return data.provenance;
}

export async function submitDiffFeedback(
  diffId: string,
  status: DiffRelationshipStatus
): Promise<{
  success: boolean;
  diffId: string;
  relationshipStatus: string;
}> {
  return fetchWithAuth<{
    success: boolean;
    diffId: string;
    relationshipStatus: string;
  }>(
    `/api/thought-diffs/${diffId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify({
        status,
      }),
    }
  );
}