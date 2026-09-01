import {
  getCurrentIdToken,
} from './firebase.ts';

export type AdminMirrorRoomStatus =
  | 'active'
  | 'closed';

export interface AdminMirrorRoomIdentity {
  uid:
    string;

  email:
    string | null;
}

export interface AdminMirrorRoomParticipant {
  uid:
    string;

  email:
    string | null;

  role:
    | 'host'
    | 'participant';

  joinedAt:
    string | null;
}

export interface AdminMirrorRoomRow {
  id:
    string;

  creator:
    AdminMirrorRoomIdentity;

  participants:
    AdminMirrorRoomParticipant[];

  participantCount:
    number;

  createdAt:
    string | null;

  expiresAt:
    string | null;

  status:
    AdminMirrorRoomStatus;

  closureReason:
    string | null;

  privacyBoundary: {
    roomPromptVisible:
      false;

    contributionsVisible:
      false;

    summariesVisible:
      false;

    takeawaysVisible:
      false;

    privateJournalVisible:
      false;
  };
}

export interface AdminMirrorRoomAnalytics {
  counts: {
    total:
      number;

    active:
      number;

    closed:
      number;
  };

  rooms:
    AdminMirrorRoomRow[];

  privacyNotice:
    string;

  generatedAt:
    string;
}

export async function getAdminMirrorRooms():
  Promise<AdminMirrorRoomAnalytics> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new Error(
      'Not authenticated.'
    );
  }

  const response =
    await fetch(
      '/api/admin/mirror-rooms',
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  let data:
    any =
    null;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.error ===
      'string'
        ? data.error
        : `Admin MirrorRoom request failed with status ${response.status}.`
    );
  }

  return data as
    AdminMirrorRoomAnalytics;
}
