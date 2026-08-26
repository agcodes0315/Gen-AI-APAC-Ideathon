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
  createdAt: string; // ISO string for client
  updatedAt: string;
  snapshotId?: string | null;
  snapshot?: ThoughtSnapshot | null;
}

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
