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
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new ApiError('Not authenticated. Please sign in.', 401, 'AUTH_REQUIRED');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
       data.message ||
       data.error ||
      `Request failed with status ${res.status}`,
      res.status,
  data.code
);
  }

  return data as T;
}

// Journal API methods
export async function createJournalEntry(content: string, tags: string[]): Promise<{ journal: JournalEntry }> {
  return fetchWithAuth<{ success: boolean; journal: JournalEntry }>('/api/journal', {
    method: 'POST',
    body: JSON.stringify({ content, tags }),
  });
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const data = await fetchWithAuth<{ entries: JournalEntry[] }>('/api/journal', {
    method: 'GET',
  });
  return data.entries;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await fetchWithAuth<{ success: boolean }>(`/api/journal/${id}`, {
    method: 'DELETE',
  });
}

// Conversation API methods
export async function createConversation(title?: string, journalId?: string): Promise<{ conversationId: string }> {
  return fetchWithAuth<{ conversationId: string }>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title, journalId }),
  });
}

// Thought Snapshot API methods (Phase 3A)
export async function proposeThoughtSnapshot(
  journalId: string
): Promise<{ success: boolean; proposal: ThoughtSnapshotProposal; modelUsed?: string }> {
  return fetchWithAuth<{ success: boolean; proposal: ThoughtSnapshotProposal; modelUsed?: string }>(
    '/api/thought-snapshots/propose',
    {
      method: 'POST',
      body: JSON.stringify({ journalId }),
    }
  );
}

export async function approveThoughtSnapshot(
  payload: ApproveSnapshotPayload
): Promise<{ success: boolean; snapshot: ThoughtSnapshot }> {
  return fetchWithAuth<{ success: boolean; snapshot: ThoughtSnapshot }>(
    '/api/thought-snapshots/approve',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchThoughtSnapshots(): Promise<ThoughtSnapshot[]> {
  const data = await fetchWithAuth<{ snapshots: ThoughtSnapshot[] }>('/api/thought-snapshots', {
    method: 'GET',
  });
  return data.snapshots;
}

export async function deleteThoughtSnapshot(id: string): Promise<void> {
  await fetchWithAuth<{ success: boolean }>(`/api/thought-snapshots/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchConversations(): Promise<Conversation[]> {
  const data = await fetchWithAuth<{ conversations: Conversation[] }>('/api/conversations', {
    method: 'GET',
  });
  return data.conversations;
}

export async function fetchConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
  const data = await fetchWithAuth<{ messages: ConversationMessage[] }>(
    `/api/conversations/${conversationId}/messages`,
    { method: 'GET' }
  );
  return data.messages;
}

export async function sendConversationMessage(
  conversationId: string,
  message: string
): Promise<BrainstormResponse> {
  return fetchWithAuth<BrainstormResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
}

// Thought Diff API methods (Phase 3B)
export async function generateThoughtDiff(snapshotId: string): Promise<GenerateDiffResponse> {
  return fetchWithAuth<GenerateDiffResponse>('/api/thought-diffs/generate', {
    method: 'POST',
    body: JSON.stringify({ snapshotId }),
  });
}

export async function fetchThoughtDiffs(): Promise<ThoughtDiff[]> {
  const data = await fetchWithAuth<{ diffs: ThoughtDiff[] }>('/api/thought-diffs', {
    method: 'GET',
  });
  return data.diffs;
}

export async function fetchDiffProvenance(diffId: string): Promise<ThoughtDiffProvenance> {
  const data = await fetchWithAuth<{ provenance: ThoughtDiffProvenance }>(
    `/api/thought-diffs/${diffId}/provenance`,
    { method: 'GET' }
  );
  return data.provenance;
}

export async function submitDiffFeedback(
  diffId: string,
  status: DiffRelationshipStatus
): Promise<{ success: boolean; diffId: string; relationshipStatus: string }> {
  return fetchWithAuth<{ success: boolean; diffId: string; relationshipStatus: string }>(
    `/api/thought-diffs/${diffId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify({ status }),
    }
  );
}
