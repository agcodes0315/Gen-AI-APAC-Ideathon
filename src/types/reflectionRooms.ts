export type MirrorRoomVisibility =
  | 'named'
  | 'anonymous';

export type MirrorRoomStatus =
  | 'open'
  | 'closed'
  | 'expired';

export interface MirrorRoom {
  id: string;
  ownerUid: string;
  title: string;
  prompt: string;
  inviteCode: string;
  status: MirrorRoomStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  contributionCount: number;
  isHost?: boolean;
}

export interface MirrorRoomParticipant {
  id: string;
  uid?: string;
  role: 'host' | 'participant';
  displayName: string;
  visibility: MirrorRoomVisibility;
  joinedAt: string;
}

export interface MirrorRoomContribution {
  id: string;
  roomId: string;
  ownerUid?: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  shareApproved: true;
}

export interface MirrorRoomSummary {
  roomId: string;
  createdAt: string;
  participantCount: number;
  contributionCount: number;
  sharedContributions: MirrorRoomContribution[];
  note: 'human_only';
}
