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

  approvalStatus:
    | 'approved'
    | 'rejected'
    | 'pending';

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

/* ============================================================
   THOUGHT DIFF
   ============================================================ */

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

  relationshipStatus:
    DiffRelationshipStatus;

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

  provenance?:
    ThoughtDiffProvenance;
}

/* ============================================================
   PERSPECTIVE WATCH
   ============================================================ */

/**
 * We deliberately restrict reminder choices instead
 * of accepting arbitrary day counts from the client.
 *
 * This keeps both the UI and backend validation simple.
 */
export type PerspectiveWatchDelayDays =
  | 7
  | 30
  | 90;

/**
 * scheduled:
 *   Reminder exists but revisit time has not arrived.
 *
 * due:
 *   Backend determined revisitAt <= now.
 *
 * completed:
 *   User intentionally revisited the perspective.
 *
 * dismissed:
 *   User stopped watching / revoked reminder.
 */
export type PerspectiveWatchStatus =
  | 'scheduled'
  | 'due'
  | 'completed'
  | 'dismissed';

export interface PerspectiveWatch {
  id: string;

  /**
   * Thought Diff this reminder belongs to.
   */
  diffId: string;

  /**
   * Stored for safe display in notification/email
   * without needing to copy journal text.
   */
  topic: string;

  /**
   * Owner-bound source references.
   */
  earlierSnapshotId: string;
  laterSnapshotId: string;

  earlierJournalId: string;
  laterJournalId: string;

  /**
   * Explicit user-selected reminder interval.
   */
  delayDays:
    PerspectiveWatchDelayDays;

  /**
   * ISO timestamp visible to the client.
   */
  revisitAt: string;

  status:
    PerspectiveWatchStatus;

  /**
   * User explicitly opted into email delivery.
   */
  emailEnabled: boolean;

  /**
   * Timestamp when the watch was created.
   */
  createdAt: string;

  updatedAt: string;

  /**
   * Optional backend bookkeeping.
   */
  dueAt?: string | null;

  completedAt?: string | null;

  dismissedAt?: string | null;

  /**
   * Email lifecycle metadata.
   *
   * This is NOT the email body.
   * It only tracks delivery state.
   */
  emailQueuedAt?: string | null;

  emailSentAt?: string | null;

  emailError?: string | null;

  emailJobId?: string | null;
}

export interface CreatePerspectiveWatchPayload {
  diffId: string;

  delayDays:
    PerspectiveWatchDelayDays;

  emailEnabled: boolean;
}

export interface CreatePerspectiveWatchResponse {
  success: boolean;

  alreadyExists?: boolean;

  watch:
    PerspectiveWatch;
}

export interface FetchPerspectiveWatchesResponse {
  watches:
    PerspectiveWatch[];
}

export interface UpdatePerspectiveWatchResponse {
  success: boolean;

  watch:
    PerspectiveWatch;
}

/* ============================================================
   REMINDER PROCESSING
   ============================================================ */

/**
 * Returned by the protected reminder processor.
 * Useful for Cloud Scheduler and controlled testing.
 */
export interface ProcessPerspectiveWatchesResponse {
  success: boolean;

  processed: number;

  markedDue: number;

  emailsQueued: number;

  skipped: number;

  errors: number;
}

/* ============================================================
   EMAIL DELIVERY
   ============================================================ */

/**
 * Firestore Trigger Email extension manages the actual
 * delivery document after MirrorTrace creates it.
 *
 * We intentionally do not expose journal text here.
 */
export type ReminderEmailDeliveryState =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'RETRY';

export interface ReminderEmailDelivery {
  state?:
    ReminderEmailDeliveryState;

  startTime?: unknown;

  endTime?: unknown;

  error?: string;

  attempts?: number;

  info?: {
    messageId?: string;

    accepted?: string[];

    rejected?: string[];

    pending?: string[];

    response?: string;
  };
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