import { Router } from 'express';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

export const reflectionRoomRouter = Router();

type RoomVisibilityMode = 'anonymous' | 'display_name';
type RoomStatus = 'open' | 'closed' | 'expired';

function text(value: unknown, max = 500): string {
  return typeof value === 'string'
    ? value.trim().slice(0, max)
    : '';
}

function bool(value: unknown): boolean {
  return value === true;
}

function hoursFromNow(hours: number): string {
  const safeHours = Math.max(1, Math.min(Math.floor(hours), 168));
  return new Date(Date.now() + safeHours * 60 * 60 * 1000).toISOString();
}

function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let output = '';

  for (let i = 0; i < 8; i += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return output;
}

function roomRef(roomId: string) {
  return firestore.collection('mirrorRooms').doc(roomId);
}

function participantsRef(roomId: string) {
  return roomRef(roomId).collection('participants');
}

function contributionsRef(roomId: string) {
  return roomRef(roomId).collection('contributions');
}

async function getRoom(roomId: string) {
  const snap = await roomRef(roomId).get();

  if (!snap.exists) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  } as Record<string, unknown>;
}

async function ensureMembership(
  roomId: string,
  uid: string
): Promise<boolean> {
  const participant = await participantsRef(roomId)
    .doc(uid)
    .get();

  return participant.exists;
}

async function ensureOpenRoom(roomId: string) {
  const room = await getRoom(roomId);

  if (!room) {
    return {
      ok: false as const,
      status: 404,
      body: {
        error: 'MirrorRoom not found.',
        code: 'ROOM_NOT_FOUND',
      },
    };
  }

  const status = String(room.status || 'open') as RoomStatus;
  const expiresAt = text(room.expiresAt, 100);

  if (
    status === 'closed' ||
    (expiresAt && Date.parse(expiresAt) <= Date.now())
  ) {
    if (status !== 'closed') {
      await roomRef(roomId).set(
        {
          status: 'expired',
          updatedAt: new Date().toISOString(),
          serverUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return {
      ok: false as const,
      status: 410,
      body: {
        error: 'This MirrorRoom is no longer open.',
        code: 'ROOM_CLOSED_OR_EXPIRED',
      },
    };
  }

  return {
    ok: true as const,
    room,
  };
}

/* ============================================================
   DIAGNOSTIC
   ============================================================ */

reflectionRoomRouter.get(
  '/api/mirror-rooms/ping',
  (_req, res) => {
    return res.status(200).json({
      ok: true,
      service: 'MirrorRoom API',
      mounted: true,
    });
  }
);

/* ============================================================
   CREATE ROOM
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const body =
        req.body && typeof req.body === 'object'
          ? req.body
          : {};

      const title = text(body.title, 120);
      const prompt = text(body.prompt, 2000);

      const visibilityMode: RoomVisibilityMode =
        body.visibilityMode === 'display_name'
          ? 'display_name'
          : 'anonymous';

      const displayName = text(body.displayName, 80);

      const requestedHours = Number(body.expiresInHours);
      const expiresInHours =
        Number.isFinite(requestedHours)
          ? Math.max(1, Math.min(Math.floor(requestedHours), 168))
          : 24;

      if (!title || !prompt) {
        return res.status(400).json({
          error: 'Room title and shared prompt are required.',
          code: 'INVALID_ROOM_INPUT',
        });
      }

      const now = new Date().toISOString();
      const ref = firestore.collection('mirrorRooms').doc();

      let inviteCode = generateInviteCode();

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const existing = await firestore
          .collection('mirrorRooms')
          .where('inviteCode', '==', inviteCode)
          .limit(1)
          .get();

        if (existing.empty) break;
        inviteCode = generateInviteCode();
      }

      const room = {
        id: ref.id,
        ownerUid: req.user!.uid,
        title,
        prompt,
        inviteCode,
        status: 'open' as RoomStatus,
        expiresAt: hoursFromNow(expiresInHours),
        participantCount: 1,
        contributionCount: 0,
        createdAt: now,
        updatedAt: now,
        serverCreatedAt: FieldValue.serverTimestamp(),
        serverUpdatedAt: FieldValue.serverTimestamp(),
      };

      await ref.set(room);

      await participantsRef(ref.id)
        .doc(req.user!.uid)
        .set({
          uid: req.user!.uid,
          role: 'host',
          visibilityMode,
          displayName:
            visibilityMode === 'display_name'
              ? displayName || 'Host'
              : null,
          joinedAt: now,
          serverJoinedAt: FieldValue.serverTimestamp(),
        });

      return res.status(201).json({
        success: true,
        room: {
          ...room,
          isHost: true,
          participantRole: 'host',
        },
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Create failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom could not be created.',
        code: 'ROOM_CREATE_FAILED',
      });
    }
  }
);

/* ============================================================
   JOIN ROOM
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/join',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const body =
        req.body && typeof req.body === 'object'
          ? req.body
          : {};

      const inviteCode = text(body.inviteCode, 32).toUpperCase();

      const visibilityMode: RoomVisibilityMode =
        body.visibilityMode === 'display_name'
          ? 'display_name'
          : 'anonymous';

      const displayName = text(body.displayName, 80);

      if (!inviteCode) {
        return res.status(400).json({
          error: 'Invite code is required.',
          code: 'INVITE_CODE_REQUIRED',
        });
      }

      const snapshot = await firestore
        .collection('mirrorRooms')
        .where('inviteCode', '==', inviteCode)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          error: 'No MirrorRoom matches that invite code.',
          code: 'ROOM_NOT_FOUND',
        });
      }

      const roomDoc = snapshot.docs[0];
      const openResult = await ensureOpenRoom(roomDoc.id);

      if (!openResult.ok) {
        return res.status(openResult.status).json(openResult.body);
      }

      const participantRef = participantsRef(roomDoc.id).doc(req.user!.uid);
      const existing = await participantRef.get();
      const now = new Date().toISOString();

      if (!existing.exists) {
        await participantRef.set({
          uid: req.user!.uid,
          role: 'participant',
          visibilityMode,
          displayName:
            visibilityMode === 'display_name'
              ? displayName || 'Participant'
              : null,
          joinedAt: now,
          serverJoinedAt: FieldValue.serverTimestamp(),
        });

        await roomRef(roomDoc.id).set(
          {
            participantCount: FieldValue.increment(1),
            updatedAt: now,
            serverUpdatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      const room = await getRoom(roomDoc.id);

      return res.status(200).json({
        success: true,
        room: {
          ...room,
          isHost: room?.ownerUid === req.user!.uid,
          participantRole:
            room?.ownerUid === req.user!.uid
              ? 'host'
              : 'participant',
        },
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Join failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom could not be joined.',
        code: 'ROOM_JOIN_FAILED',
      });
    }
  }
);

/* ============================================================
   GET ROOM
   ============================================================ */

reflectionRoomRouter.get(
  '/api/mirror-rooms/:roomId',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const roomId = text(req.params.roomId, 200);

      if (!roomId) {
        return res.status(400).json({
          error: 'Room ID is required.',
          code: 'ROOM_ID_REQUIRED',
        });
      }

      const room = await getRoom(roomId);

      if (!room) {
        return res.status(404).json({
          error: 'MirrorRoom not found.',
          code: 'ROOM_NOT_FOUND',
        });
      }

      const member = await ensureMembership(roomId, req.user!.uid);

      if (!member) {
        return res.status(403).json({
          error: 'You are not a participant in this MirrorRoom.',
          code: 'ROOM_MEMBERSHIP_REQUIRED',
        });
      }

      const [participants, contributions] = await Promise.all([
        participantsRef(roomId).limit(100).get(),
        contributionsRef(roomId).orderBy('createdAt', 'asc').limit(250).get(),
      ]);

      return res.status(200).json({
        room: {
          ...room,
          isHost: room.ownerUid === req.user!.uid,
          participants: participants.docs.map((doc) => {
            const data = doc.data();

            return {
              uid:
                doc.id === req.user!.uid
                  ? doc.id
                  : undefined,
              role: data.role || 'participant',
              visibilityMode: data.visibilityMode || 'anonymous',
              displayName:
                data.visibilityMode === 'display_name'
                  ? data.displayName || 'Participant'
                  : 'Anonymous participant',
              joinedAt: data.joinedAt || null,
            };
          }),
          contributions: contributions.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        },
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Fetch failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom could not be loaded.',
        code: 'ROOM_FETCH_FAILED',
      });
    }
  }
);

/* ============================================================
   SHARE A THOUGHT
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/contributions',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const roomId = text(req.params.roomId, 200);
      const sharedText = text(req.body?.text, 4000);

      if (!sharedText) {
        return res.status(400).json({
          error: 'Shared thought cannot be empty.',
          code: 'EMPTY_CONTRIBUTION',
        });
      }

      const openResult = await ensureOpenRoom(roomId);

      if (!openResult.ok) {
        return res.status(openResult.status).json(openResult.body);
      }

      const participantDoc = await participantsRef(roomId)
        .doc(req.user!.uid)
        .get();

      if (!participantDoc.exists) {
        return res.status(403).json({
          error: 'You are not a participant in this MirrorRoom.',
          code: 'ROOM_MEMBERSHIP_REQUIRED',
        });
      }

      const participant = participantDoc.data() || {};
      const now = new Date().toISOString();
      const ref = contributionsRef(roomId).doc();

      const contribution = {
        id: ref.id,
        ownerUid: req.user!.uid,
        text: sharedText,
        visibilityMode: participant.visibilityMode || 'anonymous',
        displayName:
          participant.visibilityMode === 'display_name'
            ? participant.displayName || 'Participant'
            : 'Anonymous participant',
        createdAt: now,
        serverCreatedAt: FieldValue.serverTimestamp(),
      };

      await ref.set(contribution);

      await roomRef(roomId).set(
        {
          contributionCount: FieldValue.increment(1),
          updatedAt: now,
          serverUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.status(201).json({
        success: true,
        contribution,
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Contribution failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'The shared thought could not be added.',
        code: 'CONTRIBUTION_FAILED',
      });
    }
  }
);

/* ============================================================
   FACTUAL ROOM SUMMARY
   No Gemini/API usage.
   ============================================================ */

reflectionRoomRouter.get(
  '/api/mirror-rooms/:roomId/summary',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const roomId = text(req.params.roomId, 200);

      const member = await ensureMembership(roomId, req.user!.uid);

      if (!member) {
        return res.status(403).json({
          error: 'You are not a participant in this MirrorRoom.',
          code: 'ROOM_MEMBERSHIP_REQUIRED',
        });
      }

      const [room, participants, contributions] = await Promise.all([
        getRoom(roomId),
        participantsRef(roomId).get(),
        contributionsRef(roomId).orderBy('createdAt', 'asc').get(),
      ]);

      if (!room) {
        return res.status(404).json({
          error: 'MirrorRoom not found.',
          code: 'ROOM_NOT_FOUND',
        });
      }

      const items = contributions.docs.map((doc) => doc.data());

      const summary = {
        roomId,
        title: room.title,
        prompt: room.prompt,
        participantCount: participants.size,
        contributionCount: items.length,
        contributions: items.map((item) => ({
          displayName:
            item.displayName || 'Anonymous participant',
          text: item.text || '',
          createdAt: item.createdAt || null,
        })),
      };

      return res.status(200).json({ summary });
    } catch (error) {
      console.error(
        '[MirrorRoom] Summary failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom summary could not be created.',
        code: 'ROOM_SUMMARY_FAILED',
      });
    }
  }
);

/* ============================================================
   CLOSE ROOM - HOST ONLY
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/close',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const roomId = text(req.params.roomId, 200);
      const room = await getRoom(roomId);

      if (!room) {
        return res.status(404).json({
          error: 'MirrorRoom not found.',
          code: 'ROOM_NOT_FOUND',
        });
      }

      if (room.ownerUid !== req.user!.uid) {
        return res.status(403).json({
          error: 'Only the MirrorRoom host can close this room.',
          code: 'ROOM_HOST_REQUIRED',
        });
      }

      await roomRef(roomId).set(
        {
          status: 'closed',
          closedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          serverUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error(
        '[MirrorRoom] Close failed:',
        error instanceof Error ? error.message : error
      );

      return res.status(500).json({
        error: 'MirrorRoom could not be closed.',
        code: 'ROOM_CLOSE_FAILED',
      });
    }
  }
);
