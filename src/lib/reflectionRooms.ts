import { getCurrentIdToken } from './firebase.ts';

import type {
  CreateMirrorRoomInput,
  JoinMirrorRoomInput,
  MirrorRoom,
  MirrorRoomContribution,
  MirrorRoomParticipant,
  MirrorRoomSummary,
  SaveMirrorRoomTakeawayInput,
  ShareMirrorRoomContributionInput,
} from '../types/reflectionRooms.ts';

class MirrorRoomApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(message);
    this.name = 'MirrorRoomApiError';
    this.status = status;
    this.code = code;
  }
}

async function roomFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new MirrorRoomApiError(
      'Please sign in again.',
      401,
      'AUTH_REQUIRED'
    );
  }

  const headers =
    new Headers(
      options.headers ||
        {}
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

  let data: any = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new MirrorRoomApiError(
      typeof data?.error ===
      'string'
        ? data.error
        : `Request failed with status ${response.status}.`,
      response.status,
      typeof data?.code ===
      'string'
        ? data.code
        : undefined
    );
  }

  return data as T;
}

export async function createMirrorRoom(
  input: CreateMirrorRoomInput
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
  input: JoinMirrorRoomInput
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
  input: ShareMirrorRoomContributionInput
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
      `/api/mirror-rooms/${encodeURIComponent(roomId)}/summary`,
      {
        method: 'POST',
      }
    );

  return data.summary;
}

export async function saveMirrorRoomTakeaway(
  input: SaveMirrorRoomTakeawayInput
): Promise<void> {
  await roomFetch(
    `/api/mirror-rooms/${encodeURIComponent(input.roomId)}/save-takeaway`,
    {
      method: 'POST',
      body:
        JSON.stringify({
          contributionId:
            input.contributionId,
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

export { MirrorRoomApiError };
