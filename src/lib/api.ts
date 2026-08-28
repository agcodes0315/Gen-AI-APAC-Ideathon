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
  PerspectiveWatch,
  PerspectiveWatchDelayDays,
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

/* ============================================================
   AUTHENTICATED REQUEST HELPER
   ============================================================ */

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

/* ============================================================
   JOURNAL VALIDATION HELPERS
   ============================================================ */

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

  if (isJournalEntry(data.journal)) {
    return {
      journal: data.journal,
    };
  }

  if (isJournalEntry(data.entry)) {
    console.warn(
      '[MirrorTrace] Journal API returned `entry` instead of `journal`. Using compatibility fallback.'
    );

    return {
      journal: data.entry,
    };
  }

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

/* ============================================================
   PERSPECTIVE WATCH API
   ============================================================ */

export async function createPerspectiveWatch(
  params: {
    diffId: string;
    delayDays: PerspectiveWatchDelayDays;
    emailEnabled: boolean;
  }
): Promise<{
  success: boolean;
  alreadyExists?: boolean;
  watch: PerspectiveWatch;
}> {
  if (!params.diffId) {
    throw new ApiError(
      'Thought Diff ID is required.',
      400,
      'DIFF_ID_REQUIRED'
    );
  }

  return fetchWithAuth<{
    success: boolean;
    alreadyExists?: boolean;
    watch: PerspectiveWatch;
  }>(
    '/api/perspective-watches',
    {
      method: 'POST',
      body: JSON.stringify({
        diffId: params.diffId,
        delayDays: params.delayDays,
        emailEnabled:
          params.emailEnabled,
      }),
    }
  );
}

export async function fetchPerspectiveWatches(): Promise<
  PerspectiveWatch[]
> {
  const data =
    await fetchWithAuth<{
      watches: PerspectiveWatch[];
    }>(
      '/api/perspective-watches',
      {
        method: 'GET',
      }
    );

  return Array.isArray(data.watches)
    ? data.watches
    : [];
}

export async function updatePerspectiveWatchStatus(
  watchId: string,
  status: 'completed' | 'dismissed'
): Promise<{
  success: boolean;
  watch: PerspectiveWatch;
}> {
  if (!watchId) {
    throw new ApiError(
      'Perspective Watch ID is required.',
      400,
      'WATCH_ID_REQUIRED'
    );
  }

  return fetchWithAuth<{
    success: boolean;
    watch: PerspectiveWatch;
  }>(
    `/api/perspective-watches/${watchId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    }
  );
}

/* ============================================================
   MEMORY GOVERNANCE API
   ============================================================ */

export interface MirrorTraceMemoryExport {
  exportVersion: number;
  exportedAt: string;
  journals: unknown[];
  thoughtSnapshots: unknown[];
  thoughtDiffs: unknown[];
  provenance: unknown[];
  perspectiveWatches: unknown[];
}

export async function exportMirrorTraceMemory(): Promise<
  MirrorTraceMemoryExport
> {
  return fetchWithAuth<MirrorTraceMemoryExport>(
    '/api/memory/export',
    {
      method: 'GET',
    }
  );
}

/**
 * Downloads the authenticated user's governed MirrorTrace memory
 * as a local JSON file.
 */
export async function downloadMirrorTraceMemory(): Promise<void> {
  const exported =
    await exportMirrorTraceMemory();

  const blob = new Blob(
    [
      JSON.stringify(
        exported,
        null,
        2
      ),
    ],
    {
      type: 'application/json',
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-'
      );

  link.href = url;

  link.download =
    `mirrortrace-memory-${timestamp}.json`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );
}