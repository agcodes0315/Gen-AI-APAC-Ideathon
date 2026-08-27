export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface JournalEntry {
  id: string;
  content: string;
  topicTags: string[];
  createdAt: string;
  updatedAt: string;
  snapshotId?: string | null;
  snapshot?: ThoughtSnapshot | null;
}

export type MemoryRetention =
  | 'until_removed'
  | '30_days'
  | '180_days'
  | '365_days';

export interface ThoughtSnapshot {
  id: string;
  sourceJournalId: string;
  positionStatement: string;
  topic: string;
  tags: string[];
  approvalStatus: 'approved' | 'rejected' | 'pending';
  userEdited: boolean;
  createdAt: string;
  approvedAt?: string | null;

  /**
   * MirrorTrace consent lifecycle.
   *
   * `until_removed` means the snapshot remains eligible for
   * Thought Diff matching until the user deletes it.
   */
  memoryRetention?: MemoryRetention;
  memoryExpiresAt?: string | null;
}

export interface ThoughtSnapshotProposal {
  sourceJournalId: string;
  positionStatement: string;
  topic: string;
  tags: string[];
}

export interface ApproveSnapshotPayload {
  sourceJournalId: string;
  positionStatement: string;
  topic: string;
  tags: string[];
  userEdited?: boolean;

  /**
   * Explicit user choice controlling how long this approved
   * interpretation is eligible for future AI-memory reuse.
   */
  memoryRetention?: MemoryRetention;
}

export interface Conversation {
  id: string;
  title: string;
  journalId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface BrainstormResponse {
  reply: string;
  suggestedTags?: string[];
  messageId: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

export type DiffRelationshipStatus =
  | 'verified'
  | 'useful'
  | 'not_related'
  | 'incorrect_interpretation';

export interface ThoughtDiff {
  id: string;
  earlierSnapshotId: string;
  laterSnapshotId: string;
  earlierJournalId: string;
  laterJournalId: string;
  topic: string;
  earlierPosition: string;
  laterPosition: string;
  apparentShift: string;
  apparentContinuity: string;
  relationshipAssessment: string;
  relationshipStatus: DiffRelationshipStatus;
  createdAt: string;
  provenanceId?: string;
}

export interface ThoughtDiffProvenance {
  id: string;
  diffId: string;
  earlierSnapshotId: string;
  laterSnapshotId: string;
  earlierJournalId: string;
  laterJournalId: string;
  earlierDate: string;
  laterDate: string;
  earlierExcerpt: string;
  laterExcerpt: string;
  earlierPosition: string;
  laterPosition: string;
  createdAt: string;
}

export interface GenerateDiffResponse {
  success: boolean;
  diffCreated: boolean;
  message?: string;
  diff?: ThoughtDiff;
  provenance?: ThoughtDiffProvenance;
}

/* ============================================================
   PERSPECTIVE WATCH
   ============================================================ */

export type PerspectiveWatchStatus =
  | 'scheduled'
  | 'due'
  | 'completed'
  | 'dismissed';

export type PerspectiveWatchDelayDays = 7 | 30 | 90;

export interface PerspectiveWatch {
  id: string;
  diffId: string;
  topic: string;
  revisitAt: string;
  status: PerspectiveWatchStatus;
  emailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  notifiedAt?: string | null;
  completedAt?: string | null;
}

export interface CreatePerspectiveWatchPayload {
  diffId: string;
  delayDays: PerspectiveWatchDelayDays;
  emailEnabled: boolean;
}

/* ============================================================
   MEMORY EXPORT
   ============================================================ */

export interface MirrorTraceMemoryExport {
  exportVersion: 1;
  exportedAt: string;
  journals: JournalEntry[];
  thoughtSnapshots: ThoughtSnapshot[];
  thoughtDiffs: ThoughtDiff[];
  provenance: ThoughtDiffProvenance[];
  perspectiveWatches: PerspectiveWatch[];
}
