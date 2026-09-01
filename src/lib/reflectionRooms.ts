import { getCurrentIdToken } from './firebase.ts';

/* ============================================================
   MIRRORROOM TYPES
   ============================================================ */

export type MirrorRoomVisibilityMode =
  | 'anonymous'
  | 'display_name';

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

  status:
    | 'open'
    | 'closed'
    | 'expired';

  expiresAt: string;

  participantCount: number;
  contributionCount: number;

  createdAt: string;
  updatedAt: string;

  isHost?: boolean;

  participantRole?:
    | 'host'
    | 'participant';

  participants?:
    MirrorRoomParticipant[];

  contributions?:
    MirrorRoomContribution[];
}

export interface MirrorRoomSummary {
  roomId: string;

  title?: string;
  prompt?: string;

  participantCount: number;
  contributionCount: number;

  contributions: Array<{
    displayName: string;
    text: string;
    createdAt?: string | null;
  }>;
}

/* ============================================================
   INTERNAL FETCH HELPER
   ============================================================ */

async function roomFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new Error(
      'Please sign in first.'
    );
  }

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    'Authorization',
    `Bearer ${token}`
  );

  if (
    typeof options.body ===
    'string'
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const response =
    await fetch(
      url,
      {
        ...options,
        headers,
      }
    );

  let data: any =
    null;

  try {
    data =
      await response.json();
  } catch {
    data =
      null;
  }

  if (
    !response.ok
  ) {
    throw new Error(
      typeof data?.error ===
      'string'
        ? data.error
        : `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

/* ============================================================
   CREATE ROOM
   ============================================================ */

export async function createMirrorRoom(
  input: {
    title: string;

    prompt: string;

    visibilityMode:
      MirrorRoomVisibilityMode;

    displayName?: string;

    expiresInHours?: number;
  }
): Promise<MirrorRoom> {
  const data =
    await roomFetch<{
      success: true;
      room: MirrorRoom;
    }>(
      '/api/mirror-rooms',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            input
          ),
      }
    );

  return data.room;
}

/* ============================================================
   JOIN ROOM
   ============================================================ */

export async function joinMirrorRoom(
  input: {
    inviteCode: string;

    visibilityMode:
      MirrorRoomVisibilityMode;

    displayName?: string;
  }
): Promise<MirrorRoom> {
  const data =
    await roomFetch<{
      success: true;
      room: MirrorRoom;
    }>(
      '/api/mirror-rooms/join',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            input
          ),
      }
    );

  return data.room;
}

/* ============================================================
   LOAD ROOM
   ============================================================ */

export async function getMirrorRoom(
  roomId: string
): Promise<MirrorRoom> {
  const data =
    await roomFetch<{
      room: MirrorRoom;
    }>(
      `/api/mirror-rooms/${encodeURIComponent(roomId)}`
    );

  return data.room;
}

/* ============================================================
   SHARE A THOUGHT
   ============================================================ */

export async function shareMirrorRoomThought(
  roomId: string,
  text: string
): Promise<MirrorRoomContribution> {
  const data =
    await roomFetch<{
      success: true;
      contribution:
        MirrorRoomContribution;
    }>(
      `/api/mirror-rooms/${encodeURIComponent(roomId)}/contributions`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            text,
          }),
      }
    );

  return data.contribution;
}

/* ============================================================
   ROOM SUMMARY

   IMPORTANT:
   This is a factual summary endpoint.
   It does NOT require Gemini or any paid AI API.
   ============================================================ */

export async function getMirrorRoomSummary(
  roomId: string
): Promise<MirrorRoomSummary> {
  const data =
    await roomFetch<{
      summary:
        MirrorRoomSummary;
    }>(
      `/api/mirror-rooms/${encodeURIComponent(roomId)}/summary`
    );

  return data.summary;
}

/**
 * Compatibility export used by ReflectionRoomLauncher.tsx.
 *
 * Earlier versions of the MirrorRoom UI imported:
 *
 *   buildMirrorRoomSummary
 *
 * while the backend client was later renamed to:
 *
 *   getMirrorRoomSummary
 *
 * Keeping both names prevents the Vite
 * "does not provide an export named buildMirrorRoomSummary"
 * runtime failure.
 */
export async function buildMirrorRoomSummary(
  roomId: string
): Promise<MirrorRoomSummary> {
  return getMirrorRoomSummary(
    roomId
  );
}

/* ============================================================
   CLOSE ROOM
   ============================================================ */

export async function closeMirrorRoom(
  roomId: string
): Promise<void> {
  await roomFetch(
    `/api/mirror-rooms/${encodeURIComponent(roomId)}/close`,
    {
      method:
        'POST',
    }
  );
}

/* ============================================================
   COMPATIBILITY ALIASES

   These preserve compatibility with earlier MirrorRoom component
   versions without changing backend behavior.
   ============================================================ */

export const fetchMirrorRoom =
  getMirrorRoom;

export const loadMirrorRoom =
  getMirrorRoom;

export const submitMirrorRoomThought =
  shareMirrorRoomThought;

export const createRoom =
  createMirrorRoom;

export const joinRoom =
  joinMirrorRoom;

export const closeRoom =
  closeMirrorRoom;
