import { getCurrentIdToken } from './firebase.ts';

import type {
  MirrorRoom,
  MirrorRoomContribution,
  MirrorRoomParticipant,
  MirrorRoomSummary,
  MirrorRoomVisibility,
} from '../types/reflectionRooms.ts';

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

  if (!response.ok) {
    throw new Error(
      typeof data?.error ===
      'string'
        ? data.error
        : `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

export async function createMirrorRoom(
  input: {
    title: string;
    prompt: string;
    visibility: MirrorRoomVisibility;
    expiryHours: 1 | 6 | 24 | 72;
  }
): Promise<MirrorRoom> {
  const data =
    await roomFetch<{
      room: MirrorRoom;
    }>(
      '/api/mirror-rooms',
      {
        method: 'POST',
        body:
          JSON.stringify(
            input
          ),
      }
    );

  return data.room;
}

export async function joinMirrorRoom(
  input: {
    inviteCode: string;
    visibility: MirrorRoomVisibility;
    displayName?: string;
  }
): Promise<MirrorRoom> {
  const data =
    await roomFetch<{
      room: MirrorRoom;
    }>(
      '/api/mirror-rooms/join',
      {
        method: 'POST',
        body:
          JSON.stringify(
            input
          ),
      }
    );

  return data.room;
}

export async function getMirrorRoom(
  roomId: string
): Promise<{
  room: MirrorRoom;
  participants: MirrorRoomParticipant[];
  contributions: MirrorRoomContribution[];
}> {
  return roomFetch(
    `/api/mirror-rooms/${encodeURIComponent(roomId)}`
  );
}

export async function shareMirrorRoomContribution(
  input: {
    roomId: string;
    body: string;
  }
): Promise<MirrorRoomContribution> {
  const data =
    await roomFetch<{
      contribution:
        MirrorRoomContribution;
    }>(
      `/api/mirror-rooms/${encodeURIComponent(input.roomId)}/contributions`,
      {
        method: 'POST',
        body:
          JSON.stringify({
            body:
              input.body,
          }),
      }
    );

  return data.contribution;
}

export async function buildMirrorRoomSummary(
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

export async function saveMirrorRoomTakeaway(
  input: {
    roomId: string;
    takeaway: string;
  }
): Promise<void> {
  await roomFetch(
    `/api/mirror-rooms/${encodeURIComponent(input.roomId)}/takeaway`,
    {
      method: 'POST',
      body:
        JSON.stringify({
          takeaway:
            input.takeaway,
        }),
    }
  );
}

export async function closeMirrorRoom(
  roomId: string
): Promise<void> {
  await roomFetch(
    `/api/mirror-rooms/${encodeURIComponent(roomId)}/close`,
    {
      method: 'POST',
    }
  );
}
