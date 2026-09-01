import crypto from 'crypto';

import {
  Router,
} from 'express';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

export const reflectionRoomRouter =
  Router();

const VALID_EXPIRY_HOURS =
  new Set([
    1,
    6,
    24,
    72,
  ]);

function cleanText(
  value: unknown,
  maxLength: number
): string {
  return typeof value ===
    'string'
    ? value
        .trim()
        .slice(
          0,
          maxLength
        )
    : '';
}

function inviteCode():
  string {
  return crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase();
}

function participantId(
  uid: string
): string {
  return crypto
    .createHash('sha256')
    .update(uid)
    .digest('hex')
    .slice(0, 32);
}

async function getRoomOr404(
  roomId: string
) {
  const ref =
    firestore
      .collection(
        'mirrorRooms'
      )
      .doc(roomId);

  const snap =
    await ref.get();

  if (!snap.exists) {
    return null;
  }

  return {
    ref,
    data:
      snap.data() ||
      {},
  };
}

function roomIsExpired(
  room: Record<string, unknown>
): boolean {
  const expiresAt =
    typeof room.expiresAt ===
    'string'
      ? room.expiresAt
      : '';

  return (
    !expiresAt ||
    new Date(
      expiresAt
    ).getTime() <=
      Date.now()
  );
}

/* ============================================================
   CREATE ROOM
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const body =
      req.body &&
      typeof req.body ===
        'object'
        ? req.body
        : {};

    const title =
      cleanText(
        body.title,
        120
      );

    const prompt =
      cleanText(
        body.prompt,
        1000
      );

    const visibility =
      body.visibility ===
      'anonymous'
        ? 'anonymous'
        : 'named';

    const expiryHours =
      Number(
        body.expiryHours
      );

    if (
      !title ||
      !prompt ||
      !VALID_EXPIRY_HOURS.has(
        expiryHours
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            'Title, prompt and a valid room lifetime are required.',
          code:
            'INVALID_ROOM_INPUT',
        });
    }

    const now =
      new Date();

    const roomRef =
      firestore
        .collection(
          'mirrorRooms'
        )
        .doc();

    const code =
      inviteCode();

    const expiresAt =
      new Date(
        now.getTime() +
          expiryHours *
            60 *
            60 *
            1000
      ).toISOString();

    await roomRef.set({
      id:
        roomRef.id,
      ownerUid:
        req.user!.uid,
      title,
      prompt,
      inviteCode:
        code,
      status:
        'open',
      expiresAt,
      createdAt:
        now.toISOString(),
      participantCount:
        1,
      serverCreatedAt:
        FieldValue
          .serverTimestamp(),
    });

    const hostParticipantRef =
      roomRef
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    await hostParticipantRef.set({
      id:
        hostParticipantRef.id,
      uid:
        req.user!.uid,
      displayName:
        visibility ===
        'anonymous'
          ? 'Anonymous host'
          : cleanText(
              req.user?.name ||
              req.user?.email,
              120
            ) ||
            'Host',
      visibility,
      joinedAt:
        now.toISOString(),
      serverJoinedAt:
        FieldValue
          .serverTimestamp(),
    });

    return res
      .status(201)
      .json({
        room: {
          id:
            roomRef.id,
          ownerUid:
            req.user!.uid,
          title,
          prompt,
          inviteCode:
            code,
          status:
            'open',
          expiresAt,
          createdAt:
            now.toISOString(),
          participantCount:
            1,
        },
      });
  }
);

/* ============================================================
   JOIN ROOM
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/join',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const body =
      req.body &&
      typeof req.body ===
        'object'
        ? req.body
        : {};

    const inviteCodeInput =
      cleanText(
        body.inviteCode,
        32
      ).toUpperCase();

    if (!inviteCodeInput) {
      return res
        .status(400)
        .json({
          error:
            'Invite code is required.',
          code:
            'INVITE_CODE_REQUIRED',
        });
    }

    const snapshot =
      await firestore
        .collection(
          'mirrorRooms'
        )
        .where(
          'inviteCode',
          '==',
          inviteCodeInput
        )
        .limit(1)
        .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    const roomDoc =
      snapshot.docs[0];

    const room =
      roomDoc.data();

    if (
      room.status !==
        'open' ||
      roomIsExpired(room)
    ) {
      return res
        .status(410)
        .json({
          error:
            'This Reflection Room is no longer open.',
          code:
            'ROOM_CLOSED',
        });
    }

    const visibility =
      body.visibility ===
      'anonymous'
        ? 'anonymous'
        : 'named';

    const customDisplayName =
      cleanText(
        body.displayName,
        120
      );

    const participantRef =
      roomDoc.ref
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    const existing =
      await participantRef
        .get();

    if (!existing.exists) {
      await roomDoc.ref
        .update({
          participantCount:
            FieldValue
              .increment(1),
        });
    }

    const joinedAt =
      new Date()
        .toISOString();

    await participantRef.set(
      {
        id:
          participantRef.id,
        uid:
          req.user!.uid,
        displayName:
          visibility ===
          'anonymous'
            ? 'Anonymous participant'
            : customDisplayName ||
              cleanText(
                req.user?.name ||
                req.user?.email,
                120
              ) ||
              'Participant',
        visibility,
        joinedAt,
        serverJoinedAt:
          FieldValue
            .serverTimestamp(),
      },
      {
        merge:
          true,
      }
    );

    const refreshed =
      await roomDoc.ref
        .get();

    return res.json({
      room: {
        id:
          roomDoc.id,
        ...refreshed.data(),
      },
    });
  }
);

/* ============================================================
   VIEW ROOM

   Important privacy rule:
   only users who joined this room can read shared room content.
   No endpoint reads anyone's private journal/memory.
   ============================================================ */

reflectionRoomRouter.get(
  '/api/mirror-rooms/:roomId',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const found =
      await getRoomOr404(
        req.params.roomId
      );

    if (!found) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    const participantRef =
      found.ref
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    const participantSnap =
      await participantRef
        .get();

    if (!participantSnap.exists) {
      return res
        .status(403)
        .json({
          error:
            'Join this room before viewing shared content.',
          code:
            'ROOM_MEMBERSHIP_REQUIRED',
        });
    }

    const [
      participantSnapshot,
      contributionSnapshot,
    ] =
      await Promise.all([
        found.ref
          .collection(
            'participants'
          )
          .limit(100)
          .get(),

        found.ref
          .collection(
            'contributions'
          )
          .orderBy(
            'createdAt',
            'asc'
          )
          .limit(300)
          .get(),
      ]);

    return res.json({
      room: {
        id:
          found.ref.id,
        ...found.data,
      },

      participants:
        participantSnapshot
          .docs
          .map(
            (
              document
            ) => ({
              id:
                document.id,
              ...document
                .data(),
            })
          ),

      contributions:
        contributionSnapshot
          .docs
          .map(
            (
              document
            ) => ({
              id:
                document.id,
              ...document
                .data(),
            })
          ),
    });
  }
);

/* ============================================================
   SHARE A THOUGHT

   This is the consent boundary.
   Nothing is copied automatically from journals or AI memory.
   The client sends only the exact text the user chose to share.
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/contributions',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const found =
      await getRoomOr404(
        req.params.roomId
      );

    if (!found) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    if (
      found.data.status !==
        'open' ||
      roomIsExpired(
        found.data
      )
    ) {
      return res
        .status(410)
        .json({
          error:
            'This Reflection Room is no longer open.',
          code:
            'ROOM_CLOSED',
        });
    }

    const participantRef =
      found.ref
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    const participant =
      await participantRef
        .get();

    if (!participant.exists) {
      return res
        .status(403)
        .json({
          error:
            'Join this room before sharing.',
          code:
            'ROOM_MEMBERSHIP_REQUIRED',
        });
    }

    const body =
      cleanText(
        req.body?.body,
        3000
      );

    if (!body) {
      return res
        .status(400)
        .json({
          error:
            'Shared thought cannot be empty.',
          code:
            'EMPTY_CONTRIBUTION',
        });
    }

    const participantData =
      participant.data() ||
      {};

    const contributionRef =
      found.ref
        .collection(
          'contributions'
        )
        .doc();

    const createdAt =
      new Date()
        .toISOString();

    const contribution = {
      id:
        contributionRef.id,
      roomId:
        found.ref.id,
      ownerUid:
        req.user!.uid,
      authorLabel:
        cleanText(
          participantData
            .displayName,
          120
        ) ||
        'Participant',
      body,
      createdAt,
      shareApproved:
        true as const,
    };

    await contributionRef
      .set({
        ...contribution,
        serverCreatedAt:
          FieldValue
            .serverTimestamp(),
      });

    return res
      .status(201)
      .json({
        contribution,
      });
  }
);

/* ============================================================
   HUMAN-ONLY SUMMARY

   Safe default while Gemini is unavailable or not desired.
   Uses only explicitly shared room content.
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/summary',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const found =
      await getRoomOr404(
        req.params.roomId
      );

    if (!found) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    const participantRef =
      found.ref
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    const membership =
      await participantRef
        .get();

    if (!membership.exists) {
      return res
        .status(403)
        .json({
          error:
            'Room membership is required.',
          code:
            'ROOM_MEMBERSHIP_REQUIRED',
        });
    }

    const [
      participants,
      contributions,
    ] =
      await Promise.all([
        found.ref
          .collection(
            'participants'
          )
          .get(),

        found.ref
          .collection(
            'contributions'
          )
          .orderBy(
            'createdAt',
            'asc'
          )
          .get(),
      ]);

    const sharedContributions =
      contributions.docs
        .map(
          (
            document
          ) => ({
            id:
              document.id,
            ...document.data(),
          })
        );

    return res.json({
      summary: {
        roomId:
          found.ref.id,
        createdAt:
          new Date()
            .toISOString(),
        participantCount:
          participants.size,
        contributionCount:
          contributions.size,
        sharedContributions,
        note:
          'human_only',
      },
    });
  }
);

/* ============================================================
   SAVE ONLY MY TAKEAWAY

   This writes a new private journal entry under the authenticated UID.
   It does NOT copy the entire room, other participants' contributions,
   or another user's data into the journal.
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/save-takeaway',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const found =
      await getRoomOr404(
        req.params.roomId
      );

    if (!found) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    const participantRef =
      found.ref
        .collection(
          'participants'
        )
        .doc(
          participantId(
            req.user!.uid
          )
        );

    const membership =
      await participantRef
        .get();

    if (!membership.exists) {
      return res
        .status(403)
        .json({
          error:
            'Room membership is required.',
          code:
            'ROOM_MEMBERSHIP_REQUIRED',
        });
    }

    const takeaway =
      cleanText(
        req.body?.takeaway,
        5000
      );

    if (!takeaway) {
      return res
        .status(400)
        .json({
          error:
            'Takeaway is required.',
          code:
            'TAKEAWAY_REQUIRED',
        });
    }

    const now =
      new Date()
        .toISOString();

    const journalRef =
      firestore
        .collection(
          'users'
        )
        .doc(
          req.user!.uid
        )
        .collection(
          'journals'
        )
        .doc();

    await journalRef.set({
      id:
        journalRef.id,
      content:
        takeaway,
      topicTags: [
        'mirror-room',
      ],
      source:
        'mirror_room_takeaway',
      sourceRoomId:
        found.ref.id,
      createdAt:
        now,
      updatedAt:
        now,
      serverCreatedAt:
        FieldValue
          .serverTimestamp(),
      serverUpdatedAt:
        FieldValue
          .serverTimestamp(),
    });

    return res
      .status(201)
      .json({
        success:
          true,
        journalId:
          journalRef.id,
      });
  }
);

/* ============================================================
   CLOSE ROOM

   Only the room owner can close it.
   ============================================================ */

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/close',
  authMiddleware,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    const found =
      await getRoomOr404(
        req.params.roomId
      );

    if (!found) {
      return res
        .status(404)
        .json({
          error:
            'Reflection Room not found.',
          code:
            'ROOM_NOT_FOUND',
        });
    }

    if (
      found.data.ownerUid !==
      req.user!.uid
    ) {
      return res
        .status(403)
        .json({
          error:
            'Only the room host can close this room.',
          code:
            'ROOM_OWNER_REQUIRED',
        });
    }

    await found.ref.update({
      status:
        'closed',
      closedAt:
        new Date()
          .toISOString(),
      serverUpdatedAt:
        FieldValue
          .serverTimestamp(),
    });

    return res.json({
      success:
        true,
    });
  }
);
