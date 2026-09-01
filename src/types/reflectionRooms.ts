export type MirrorRoomVisibilityMode =
  | 'anonymous'
  | 'display_name';

export type MirrorRoomStatus =
  | 'open'
  | 'closed'
  | 'expired';

export interface MirrorRoomParticipant {
  uid?: string;
  role: 'host' | 'participant';
  visibilityMode: MirrorRoomVisibilityMode;
  displayName: string;
  joinedAt?: string | null;
}

export interface MirrorRoomContribution {
  id: string;
  ownerUid?: string;
  text: string;
  visibilityMode: MirrorRoomVisibilityMode;
  displayName: string;
  createdAt: string;
}

export interface MirrorRoom {
  id: string;
  ownerUid?: string;
  title: string;
  prompt: string;
  inviteCode: string;
  status: MirrorRoomStatus;
  expiresAt: string;
  participantCount: number;
  contributionCount: number;
  createdAt: string;
  updatedAt: string;
  isHost?: boolean;
  participantRole?: 'host' | 'participant';
  participants?: MirrorRoomParticipant[];
  contributions?: MirrorRoomContribution[];
}
