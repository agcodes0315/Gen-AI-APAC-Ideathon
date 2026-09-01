import { getCurrentIdToken } from './firebase.ts';

export class JournalEnhancementError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);
    this.name = 'JournalEnhancementError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getCurrentIdToken();

  if (!token) {
    throw new JournalEnhancementError(
      'Not authenticated.',
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

  const response = await fetch(
    path,
    {
      ...options,
      headers,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new JournalEnhancementError(
      String(
        data.message ||
        data.error ||
        `Request failed with ${response.status}`
      ),
      response.status,
      typeof data.code === 'string'
        ? data.code
        : undefined
    );
  }

  return data as T;
}

export interface Favorite {
  id: string;
  journalId: string;
  createdAt?: string;
}

export interface JournalVersion {
  id: string;
  journalId: string;
  previousContent: string;
  previousTopicTags: string[];
  previousUpdatedAt?: string;
  createdAt: string;
}

export interface RevisitBookmark {
  id: string;
  journalId: string;
  revisitAt: string;
  status:
    | 'scheduled'
    | 'due'
    | 'completed'
    | 'dismissed';
  emailEnabled: boolean;
  pushEnabled: boolean;
  createdAt: string;
}

export interface DailyReminderPreference {
  enabled: boolean;
  timezone: string;
  hour: number;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface DecisionLedgerItem {
  id: string;
  title: string;
  decision: string;
  reasoning: string;
  journalId?: string | null;
  status: string;
  createdAt: string;
}

export interface ReflectionChain {
  id: string;
  title: string;
  journalIds: string[];
  createdAt: string;
}

export interface AssumptionItem {
  id: string;
  statement: string;
  journalId?: string | null;
  status:
    | 'open'
    | 'supported'
    | 'challenged'
    | 'invalidated';
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  periodStart: string;
  periodEnd: string;
  reflectionCount: number;
  wordCount: number;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  entryIds: string[];
}

export interface KnowledgeGraph {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    [key: string]: unknown;
  }>;

  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export async function fetchFavorites(): Promise<Favorite[]> {
  const data = await request<{ favorites: Favorite[] }>(
    '/api/journal-enhancements/favorites'
  );
  return data.favorites;
}

export async function favoriteJournal(
  journalId: string
) {
  return request<{ success: boolean }>(
    `/api/journal-enhancements/favorites/${encodeURIComponent(journalId)}`,
    { method: 'PUT' }
  );
}

export async function unfavoriteJournal(
  journalId: string
) {
  return request<{ success: boolean }>(
    `/api/journal-enhancements/favorites/${encodeURIComponent(journalId)}`,
    { method: 'DELETE' }
  );
}

export async function editJournalEntry(
  journalId: string,
  payload: {
    content: string;
    topicTags: string[];
    confirmInvalidateDerived?: boolean;
  }
) {
  return request<{
    success: boolean;
    journal: {
      id: string;
      content: string;
      topicTags: string[];
      createdAt: string;
      updatedAt: string;
      snapshotId: null;
    };
    invalidated: {
      snapshotsDeleted: number;
      diffsDeleted: number;
      provenanceDeleted: number;
    };
  }>(
    `/api/journal-enhancements/journal/${encodeURIComponent(journalId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchJournalVersions(
  journalId: string
): Promise<JournalVersion[]> {
  const data = await request<{ versions: JournalVersion[] }>(
    `/api/journal-enhancements/journal/${encodeURIComponent(journalId)}/versions`
  );
  return data.versions;
}

export async function fetchRevisitBookmarks(): Promise<RevisitBookmark[]> {
  const data = await request<{ bookmarks: RevisitBookmark[] }>(
    '/api/journal-enhancements/revisit'
  );
  return data.bookmarks;
}

export async function createRevisitBookmark(
  payload: {
    journalId: string;
    revisitAt: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
  }
) {
  return request<{
    success: boolean;
    bookmark: RevisitBookmark;
  }>(
    '/api/journal-enhancements/revisit',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteRevisitBookmark(
  id: string
) {
  return request<{ success: boolean }>(
    `/api/journal-enhancements/revisit/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}

export async function fetchDailyReminder(): Promise<DailyReminderPreference> {
  const data = await request<{ preference: DailyReminderPreference }>(
    '/api/journal-enhancements/daily-reminder'
  );
  return data.preference;
}

export async function saveDailyReminder(
  preference: DailyReminderPreference
) {
  return request<{
    success: boolean;
    preference: DailyReminderPreference;
  }>(
    '/api/journal-enhancements/daily-reminder',
    {
      method: 'PUT',
      body: JSON.stringify(preference),
    }
  );
}

export async function fetchDecisions(): Promise<DecisionLedgerItem[]> {
  const data = await request<{ decisions: DecisionLedgerItem[] }>(
    '/api/journal-enhancements/decisions'
  );
  return data.decisions;
}

export async function createDecision(
  payload: {
    title: string;
    decision: string;
    reasoning: string;
    journalId?: string;
  }
) {
  return request<{
    success: boolean;
    decision: DecisionLedgerItem;
  }>(
    '/api/journal-enhancements/decisions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchChains(): Promise<ReflectionChain[]> {
  const data = await request<{ chains: ReflectionChain[] }>(
    '/api/journal-enhancements/chains'
  );
  return data.chains;
}

export async function createChain(
  payload: {
    title: string;
    journalIds: string[];
  }
) {
  return request<{
    success: boolean;
    chain: ReflectionChain;
  }>(
    '/api/journal-enhancements/chains',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchAssumptions(): Promise<AssumptionItem[]> {
  const data = await request<{ assumptions: AssumptionItem[] }>(
    '/api/journal-enhancements/assumptions'
  );
  return data.assumptions;
}

export async function createAssumption(
  payload: {
    statement: string;
    journalId?: string;
  }
) {
  return request<{
    success: boolean;
    assumption: AssumptionItem;
  }>(
    '/api/journal-enhancements/assumptions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateAssumption(
  id: string,
  payload: {
    status: AssumptionItem['status'];
    outcome?: string;
  }
) {
  return request<{ success: boolean }>(
    `/api/journal-enhancements/assumptions/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchWeeklyReview(): Promise<WeeklyReview> {
  const data = await request<{ review: WeeklyReview }>(
    '/api/journal-enhancements/weekly-review'
  );
  return data.review;
}

export async function fetchKnowledgeGraph(): Promise<KnowledgeGraph> {
  const data = await request<{ graph: KnowledgeGraph }>(
    '/api/journal-enhancements/knowledge-graph'
  );
  return data.graph;
}

export async function downloadJournalEnhancementExport() {
  const data = await request<Record<string, unknown>>(
    '/api/journal-enhancements/export'
  );

  const blob = new Blob(
    [
      JSON.stringify(
        data,
        null,
        2
      ),
    ],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download =
    `mirrortrace-export-${new Date().toISOString().slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}
