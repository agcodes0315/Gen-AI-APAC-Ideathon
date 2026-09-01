export type MirrorRoomStatus =
  | 'open'
  | 'closed'
  | 'expired';

export type MirrorRoomVisibility =
  | 'named'
  | 'anonymous';

export interface MirrorRoom {
  id: string;
  ownerUid: string;
  title: string;
  prompt: string;
  inviteCode: string;
  status: MirrorRoomStatus;
  expiresAt: string;
  createdAt: string;
  participantCount: number;
}

export interface MirrorRoomParticipant {
  id: string;
  uid: string;
  displayName: string;
  visibility: MirrorRoomVisibility;
  joinedAt: string;
}

export interface MirrorRoomContribution {
  id: string;
  roomId: string;
  ownerUid: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  shareApproved: true;
}

export interface MirrorRoomVoteOption {
  id: string;
  label: string;
  votes: number;
}

export interface MirrorRoomSummary {
  roomId: string;
  createdAt: string;
  participantCount: number;
  contributionCount: number;
  sharedContributions: MirrorRoomContribution[];
  note:
    | 'human_only'
    | 'ai_assisted';
}

export interface CreateMirrorRoomInput {
  title: string;
  prompt: string;
  visibility: MirrorRoomVisibility;
  expiryHours: 1 | 6 | 24 | 72;
}

export interface JoinMirrorRoomInput {
  inviteCode: string;
  visibility: MirrorRoomVisibility;
  displayName?: string;
}

export interface ShareMirrorRoomContributionInput {
  roomId: string;
  body: string;
}

export interface SaveMirrorRoomTakeawayInput {
  roomId: string;
  contributionId?: string;
  takeaway: string;
}
