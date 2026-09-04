import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';

import { requireRole } from './adminRbac.ts';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

export const reflectionRoomRouter =
  Router();

type RoomVisibility =
  | 'named'
  | 'anonymous';

type RoomStatus =
  | 'open'
  | 'closed'
  | 'expired';

const VALID_EXPIRY_HOURS =
  new Set([
    1,
    6,
    24,
    72,
  ]);

function text(
  value: unknown,
  max = 500
): string {
  return typeof value ===
    'string'
    ? value.trim().slice(0, max)
    : '';
}

function generateInviteCode():
  string {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let output = '';

  for (
    let index = 0;
    index < 8;
    index += 1
  ) {
    output +=
      alphabet[
        Math.floor(
          Math.random() *
          alphabet.length
        )
      ];
  }

  return output;
}

function roomRef(
  roomId: string
) {
  return firestore
    .collection('mirrorRooms')
    .doc(roomId);
}

function participantsRef(
  roomId: string
) {
  return roomRef(roomId)
    .collection('participants');
}

function contributionsRef(
  roomId: string
) {
  return roomRef(roomId)
    .collection('contributions');
}

async function getRoom(
  roomId: string
) {
  const snapshot =
    await roomRef(roomId)
      .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as
    Record<string, unknown>;
}

async function ensureMembership(
  roomId: string,
  uid: string
): Promise<boolean> {
  const participant =
    await participantsRef(roomId)
      .doc(uid)
      .get();

  return participant.exists;
}

function isExpired(
  room: Record<string, unknown>
): boolean {
  const expiresAt =
    text(
      room.expiresAt,
      100
    );

  return Boolean(
    expiresAt &&
    Date.parse(expiresAt) <=
      Date.now()
  );
}

async function ensureOpenRoom(
  roomId: string
) {
  const room =
    await getRoom(
      roomId
    );

  if (!room) {
    return {
      ok:
        false as const,
      status:
        404,
      body: {
        error:
          'MirrorRoom not found.',
        code:
          'ROOM_NOT_FOUND',
      },
    };
  }

  const status =
    String(
      room.status ||
      'open'
    ) as
      RoomStatus;

  if (
    status === 'closed' ||
    status === 'expired' ||
    isExpired(room)
  ) {
    if (
      status !== 'closed' &&
      status !== 'expired'
    ) {
      await roomRef(roomId)
        .set(
          {
            status:
              'expired',
            updatedAt:
              new Date()
                .toISOString(),
            serverUpdatedAt:
              FieldValue
                .serverTimestamp(),
          },
          {
            merge:
              true,
          }
        );
    }

    return {
      ok:
        false as const,
      status:
        410,
      body: {
        error:
          'This MirrorRoom is no longer open.',
        code:
          'ROOM_CLOSED_OR_EXPIRED',
      },
    };
  }

  return {
    ok:
      true as const,
    room,
  };
}

reflectionRoomRouter.get(
  '/api/mirror-rooms/ping',
  (_req, res) => {
    return res
      .status(200)
      .json({
        ok: true,
        service:
          'MirrorRoom API',
        mounted:
          true,
      });
  }
);

reflectionRoomRouter.post(
  '/api/mirror-rooms',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const body =
        req.body &&
        typeof req.body ===
          'object'
          ? req.body
          : {};

      const title =
        text(
          body.title,
          120
        );

      const prompt =
        text(
          body.prompt,
          2000
        );

      const visibility:
        RoomVisibility =
          body.visibility ===
          'named'
            ? 'named'
            : 'anonymous';

      const requestedExpiry =
        Number(
          body.expiryHours
        );

      const expiryHours =
        VALID_EXPIRY_HOURS
          .has(
            requestedExpiry
          )
          ? requestedExpiry
          : 24;

      if (
        !title ||
        !prompt
      ) {
        return res
          .status(400)
          .json({
            error:
              'Room title and shared prompt are required.',
            code:
              'INVALID_ROOM_INPUT',
          });
      }

      const now =
        new Date();

      const roomDocument =
        firestore
          .collection(
            'mirrorRooms'
          )
          .doc();

      let inviteCode =
        generateInviteCode();

      for (
        let attempt = 0;
        attempt < 8;
        attempt += 1
      ) {
        const duplicate =
          await firestore
            .collection(
              'mirrorRooms'
            )
            .where(
              'inviteCode',
              '==',
              inviteCode
            )
            .limit(1)
            .get();

        if (duplicate.empty) {
          break;
        }

        inviteCode =
          generateInviteCode();
      }

      const expiresAt =
        new Date(
          now.getTime() +
          expiryHours *
            60 *
            60 *
            1000
        ).toISOString();

      const room = {
        id:
          roomDocument.id,
        ownerUid:
          req.user!.uid,
        title,
        prompt,
        inviteCode,
        status:
          'open' as
            RoomStatus,
        expiresAt,
        participantCount:
          1,
        contributionCount:
          0,
        createdAt:
          now.toISOString(),
        updatedAt:
          now.toISOString(),
      };

      await roomDocument
        .set({
          ...room,
          serverCreatedAt:
            FieldValue
              .serverTimestamp(),
          serverUpdatedAt:
            FieldValue
              .serverTimestamp(),
        });

      const participantDocument =
        participantsRef(
          roomDocument.id
        ).doc(
          req.user!.uid
        );

      await participantDocument
        .set({
          id:
            participantDocument.id,
          uid:
            req.user!.uid,
          role:
            'host',
          visibility,
          displayName:
            visibility ===
            'named'
              ? text(
                  (req.user as { name?: string; email?: string } | undefined)?.name ||
                  req.user?.email,
                  120
                ) ||
                'Host'
              : 'Anonymous host',
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
            ...room,
            isHost:
              true,
          },
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Create failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom could not be created.',
          code:
            'ROOM_CREATE_FAILED',
        });
    }
  }
);

reflectionRoomRouter.post(
  '/api/mirror-rooms/join',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const body =
        req.body &&
        typeof req.body ===
          'object'
          ? req.body
          : {};

      const inviteCode =
        text(
          body.inviteCode,
          32
        )
          .toUpperCase();

      const visibility:
        RoomVisibility =
          body.visibility ===
          'named'
            ? 'named'
            : 'anonymous';

      const displayName =
        text(
          body.displayName,
          120
        );

      if (!inviteCode) {
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
            inviteCode
          )
          .limit(1)
          .get();

      if (snapshot.empty) {
        return res
          .status(404)
          .json({
            error:
              'No MirrorRoom matches that invite code.',
            code:
              'ROOM_NOT_FOUND',
          });
      }

      const roomDocument =
        snapshot.docs[0];

      const openResult =
        await ensureOpenRoom(
          roomDocument.id
        );

      if (!openResult.ok) {
        return res
          .status(
            openResult.status
          )
          .json(
            openResult.body
          );
      }

      const participantDocument =
        participantsRef(
          roomDocument.id
        ).doc(
          req.user!.uid
        );

      const existing =
        await participantDocument
          .get();

      const now =
        new Date()
          .toISOString();

      if (!existing.exists) {
        await participantDocument
          .set({
            id:
              participantDocument.id,
            uid:
              req.user!.uid,
            role:
              'participant',
            visibility,
            displayName:
              visibility ===
              'named'
                ? displayName ||
                  text(
                    (req.user as { name?: string; email?: string } | undefined)?.name ||
                    req.user?.email,
                    120
                  ) ||
                  'Participant'
                : 'Anonymous participant',
            joinedAt:
              now,
            serverJoinedAt:
              FieldValue
                .serverTimestamp(),
          });

        await roomRef(
          roomDocument.id
        ).set(
          {
            participantCount:
              FieldValue
                .increment(1),
            updatedAt:
              now,
            serverUpdatedAt:
              FieldValue
                .serverTimestamp(),
          },
          {
            merge:
              true,
          }
        );
      }

      const room =
        await getRoom(
          roomDocument.id
        );

      return res
        .status(200)
        .json({
          room: {
            ...room,
            isHost:
              room?.ownerUid ===
              req.user!.uid,
          },
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Join failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom could not be joined.',
          code:
            'ROOM_JOIN_FAILED',
        });
    }
  }
);

reflectionRoomRouter.get(
  '/api/mirror-rooms/:roomId',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const roomId =
        text(
          req.params.roomId,
          200
        );

      const room =
        await getRoom(
          roomId
        );

      if (!room) {
        return res
          .status(404)
          .json({
            error:
              'MirrorRoom not found.',
            code:
              'ROOM_NOT_FOUND',
          });
      }

      const member =
        await ensureMembership(
          roomId,
          req.user!.uid
        );

      if (!member) {
        return res
          .status(403)
          .json({
            error:
              'You are not a participant in this MirrorRoom.',
            code:
              'ROOM_MEMBERSHIP_REQUIRED',
          });
      }

      const [
        participantSnapshot,
        contributionSnapshot,
      ] =
        await Promise.all([
          participantsRef(roomId)
            .limit(100)
            .get(),

          contributionsRef(roomId)
            .orderBy(
              'createdAt',
              'asc'
            )
            .limit(250)
            .get(),
        ]);

      const participants =
        participantSnapshot
          .docs
          .map(
            (
              document
            ) => {
              const data =
                document.data();

              return {
                id:
                  document.id,
                uid:
                  document.id ===
                  req.user!.uid
                    ? document.id
                    : undefined,
                role:
                  data.role ===
                  'host'
                    ? 'host'
                    : 'participant',
                visibility:
                  data.visibility ===
                  'named'
                    ? 'named'
                    : 'anonymous',
                displayName:
                  text(
                    data.displayName,
                    120
                  ) ||
                  'Anonymous participant',
                joinedAt:
                  text(
                    data.joinedAt,
                    100
                  ),
              };
            }
          );

      const contributions =
        contributionSnapshot
          .docs
          .map(
            (
              document
            ) => {
              const data =
                document.data();

              return {
                id:
                  document.id,
                roomId,
                ownerUid:
                  text(
                    data.ownerUid,
                    200
                  ) ||
                  undefined,
                authorLabel:
                  text(
                    data.authorLabel,
                    120
                  ) ||
                  'Participant',
                body:
                  text(
                    data.body,
                    4000
                  ),
                createdAt:
                  text(
                    data.createdAt,
                    100
                  ),
                shareApproved:
                  true as const,
              };
            }
          );

      return res
        .status(200)
        .json({
          room: {
            ...room,
            isHost:
              room.ownerUid ===
              req.user!.uid,
          },
          participants,
          contributions,
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Fetch failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom could not be loaded.',
          code:
            'ROOM_FETCH_FAILED',
        });
    }
  }
);

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/contributions',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const roomId =
        text(
          req.params.roomId,
          200
        );

      const body =
        text(
          req.body?.body,
          4000
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

      const openResult =
        await ensureOpenRoom(
          roomId
        );

      if (!openResult.ok) {
        return res
          .status(
            openResult.status
          )
          .json(
            openResult.body
          );
      }

      const participantDocument =
        await participantsRef(roomId)
          .doc(
            req.user!.uid
          )
          .get();

      if (!participantDocument.exists) {
        return res
          .status(403)
          .json({
            error:
              'You are not a participant in this MirrorRoom.',
            code:
              'ROOM_MEMBERSHIP_REQUIRED',
          });
      }

      const participant =
        participantDocument
          .data() ||
        {};

      const now =
        new Date()
          .toISOString();

      const contributionDocument =
        contributionsRef(
          roomId
        ).doc();

      const contribution = {
        id:
          contributionDocument.id,
        roomId,
        ownerUid:
          req.user!.uid,
        authorLabel:
          text(
            participant.displayName,
            120
          ) ||
          'Participant',
        body,
        createdAt:
          now,
        shareApproved:
          true as const,
      };

      await contributionDocument
        .set({
          ...contribution,
          serverCreatedAt:
            FieldValue
              .serverTimestamp(),
        });

      await roomRef(roomId)
        .set(
          {
            contributionCount:
              FieldValue
                .increment(1),
            updatedAt:
              now,
            serverUpdatedAt:
              FieldValue
                .serverTimestamp(),
          },
          {
            merge:
              true,
          }
        );

      return res
        .status(201)
        .json({
          contribution,
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Contribution failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'The shared thought could not be added.',
          code:
            'CONTRIBUTION_FAILED',
        });
    }
  }
);

reflectionRoomRouter.get(
  '/api/mirror-rooms/:roomId/summary',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const roomId =
        text(
          req.params.roomId,
          200
        );

      const member =
        await ensureMembership(
          roomId,
          req.user!.uid
        );

      if (!member) {
        return res
          .status(403)
          .json({
            error:
              'You are not a participant in this MirrorRoom.',
            code:
              'ROOM_MEMBERSHIP_REQUIRED',
          });
      }

      const [
        participants,
        contributions,
      ] =
        await Promise.all([
          participantsRef(roomId)
            .get(),

          contributionsRef(roomId)
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
            ) => {
              const data =
                document.data();

              return {
                id:
                  document.id,
                roomId,
                ownerUid:
                  text(
                    data.ownerUid,
                    200
                  ) ||
                  undefined,
                authorLabel:
                  text(
                    data.authorLabel,
                    120
                  ) ||
                  'Participant',
                body:
                  text(
                    data.body,
                    4000
                  ),
                createdAt:
                  text(
                    data.createdAt,
                    100
                  ),
                shareApproved:
                  true as const,
              };
            }
          );

      return res
        .status(200)
        .json({
          summary: {
            roomId,
            createdAt:
              new Date()
                .toISOString(),
            participantCount:
              participants.size,
            contributionCount:
              sharedContributions
                .length,
            sharedContributions,
            note:
              'human_only',
          },
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Summary failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom summary could not be created.',
          code:
            'ROOM_SUMMARY_FAILED',
        });
    }
  }
);

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/takeaway',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const roomId =
        text(
          req.params.roomId,
          200
        );

      const takeaway =
        text(
          req.body?.takeaway,
          5000
        );

      if (!takeaway) {
        return res
          .status(400)
          .json({
            error:
              'Takeaway text is required.',
            code:
              'TAKEAWAY_REQUIRED',
          });
      }

      const member =
        await ensureMembership(
          roomId,
          req.user!.uid
        );

      if (!member) {
        return res
          .status(403)
          .json({
            error:
              'You are not a participant in this MirrorRoom.',
            code:
              'ROOM_MEMBERSHIP_REQUIRED',
          });
      }

      const now =
        new Date()
          .toISOString();

      const journalDocument =
        firestore
          .collection('users')
          .doc(
            req.user!.uid
          )
          .collection('journals')
          .doc();

      await journalDocument
        .set({
          id:
            journalDocument.id,
          content:
            takeaway,
          topicTags: [
            'mirror-room',
          ],
          source:
            'mirror_room_takeaway',
          sourceRoomId:
            roomId,
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
          success: true,
          journalId:
            journalDocument.id,
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Takeaway save failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'Your MirrorRoom takeaway could not be saved.',
          code:
            'ROOM_TAKEAWAY_SAVE_FAILED',
        });
    }
  }
);

reflectionRoomRouter.post(
  '/api/mirror-rooms/:roomId/close',
  authMiddleware,
  async (
    req:
      AuthenticatedRequest,
    res
  ) => {
    try {
      const roomId =
        text(
          req.params.roomId,
          200
        );

      const room =
        await getRoom(
          roomId
        );

      if (!room) {
        return res
          .status(404)
          .json({
            error:
              'MirrorRoom not found.',
            code:
              'ROOM_NOT_FOUND',
          });
      }

      if (
        room.ownerUid !==
        req.user!.uid
      ) {
        return res
          .status(403)
          .json({
            error:
              'Only the MirrorRoom host can close this room.',
            code:
              'ROOM_HOST_REQUIRED',
          });
      }

      const now =
        new Date()
          .toISOString();

      await roomRef(roomId)
        .set(
          {
            status:
              'closed',
            closedAt:
              now,
            updatedAt:
              now,
            serverUpdatedAt:
              FieldValue
                .serverTimestamp(),
          },
          {
            merge:
              true,
          }
        );

      return res
        .status(200)
        .json({
          success:
            true,
        });
    } catch (error) {
      console.error(
        '[MirrorRoom] Close failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom could not be closed.',
          code:
            'ROOM_CLOSE_FAILED',
        });
    }
  }
);

/* ============================================================
   ADMIN MIRRORROOM METADATA
   Privacy boundary:
   - ADMIN MAY SEE operational metadata only.
   - ADMIN MAY SEE creator identity and participant entities.
   - ADMIN MUST NEVER receive room prompt, contributions,
     summaries, takeaways, private journals, conversations,
     Thought Snapshots, Thought Diffs, provenance, or AI memory.
   ============================================================ */

function maskAdminEmail(
  email?: string | null
): string | null {
  if (!email) {
    return null;
  }

  const [
    local,
    domain,
  ] =
    email.split('@');

  if (
    !local ||
    !domain
  ) {
    return '***';
  }

  const visible =
    local.length <= 2
      ? local.slice(0, 1)
      : local.slice(0, 2);

  return `${visible}***@${domain}`;
}

function maskAdminUid(
  uid: string
): string {
  if (
    uid.length <= 10
  ) {
    return uid;
  }

  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

async function resolveAdminIdentity(
  uid: string
): Promise<{
  uid: string;
  email: string | null;
}> {
  try {
    const user =
      await getAuth()
        .getUser(uid);

    return {
      uid:
        maskAdminUid(uid),

      email:
        maskAdminEmail(
          user.email
        ),
    };
  } catch {
    return {
      uid:
        maskAdminUid(uid),

      email:
        null,
    };
  }
}

reflectionRoomRouter.get(
  '/api/admin/mirror-rooms',
  requireRole('admin'),
  async (
    _req,
    res
  ) => {
    try {
      const roomSnapshot =
        await firestore
          .collection(
            'mirrorRooms'
          )
          .orderBy(
            'createdAt',
            'desc'
          )
          .limit(100)
          .get();

      const nowMs =
        Date.now();

      const roomRows =
        await Promise.all(
          roomSnapshot.docs.map(
            async (
              roomDocument
            ) => {
              const data =
                roomDocument.data() ||
                {};

              const ownerUid =
                text(
                  data.ownerUid,
                  256
                );

              const storedStatus =
                text(
                  data.status,
                  32
                ) ||
                'open';

              const expiresAt =
                text(
                  data.expiresAt,
                  100
                );

              const expired =
                Boolean(
                  expiresAt &&
                  Number.isFinite(
                    Date.parse(
                      expiresAt
                    )
                  ) &&
                  Date.parse(
                    expiresAt
                  ) <=
                    nowMs
                );

              const active =
                storedStatus ===
                  'open' &&
                !expired;

              const participantSnapshot =
                await roomDocument.ref
                  .collection(
                    'participants'
                  )
                  .limit(100)
                  .get();

              const participantUids =
                participantSnapshot.docs
                  .map(
                    (
                      participantDocument
                    ) =>
                      text(
                        participantDocument.id,
                        256
                      )
                  )
                  .filter(
                    Boolean
                  );

              const uniqueUids =
                Array.from(
                  new Set(
                    [
                      ownerUid,
                      ...participantUids,
                    ].filter(
                      Boolean
                    )
                  )
                );

              const identities =
                await Promise.all(
                  uniqueUids.map(
                    (
                      uid
                    ) =>
                      resolveAdminIdentity(
                        uid
                      )
                  )
                );

              const identityByUid =
                new Map(
                  uniqueUids.map(
                    (
                      uid,
                      index
                    ) => [
                      uid,
                      identities[index],
                    ]
                  )
                );

              const creator =
                ownerUid
                  ? identityByUid.get(
                      ownerUid
                    ) ??
                    {
                      uid:
                        maskAdminUid(
                          ownerUid
                        ),
                      email:
                        null,
                    }
                  : {
                      uid:
                        'unknown',
                      email:
                        null,
                    };

              const participants =
                participantSnapshot.docs.map(
                  (
                    participantDocument
                  ) => {
                    const participantData =
                      participantDocument.data() ||
                      {};

                    const participantUid =
                      participantDocument.id;

                    const identity =
                      identityByUid.get(
                        participantUid
                      ) ??
                      {
                        uid:
                          maskAdminUid(
                            participantUid
                          ),
                        email:
                          null,
                      };

                    return {
                      uid:
                        identity.uid,

                      email:
                        identity.email,

                      role:
                        participantData.role ===
                        'host'
                          ? 'host'
                          : 'participant',

                      joinedAt:
                        text(
                          participantData.joinedAt,
                          100
                        ) ||
                        null,
                    };
                  }
                );

              return {
                id:
                  maskAdminUid(
                    roomDocument.id
                  ),

                creator,

                participants,

                participantCount:
                  participants.length,

                createdAt:
                  text(
                    data.createdAt,
                    100
                  ) ||
                  null,

                expiresAt:
                  expiresAt ||
                  null,

                status:
                  active
                    ? 'active'
                    : 'closed',

                closureReason:
                  active
                    ? null
                    : storedStatus ===
                        'closed'
                      ? 'host_closed'
                      : expired
                        ? 'expired'
                        : storedStatus,

                privacyBoundary: {
                  roomPromptVisible:
                    false,

                  contributionsVisible:
                    false,

                  summariesVisible:
                    false,

                  takeawaysVisible:
                    false,

                  privateJournalVisible:
                    false,
                },
              };
            }
          )
        );

      const total =
        roomRows.length;

      const active =
        roomRows.filter(
          (
            room
          ) =>
            room.status ===
            'active'
        ).length;

      const closed =
        total -
        active;

      return res
        .status(200)
        .json({
          counts: {
            total,
            active,
            closed,
          },

          rooms:
            roomRows,

          privacyNotice:
            'MirrorRoom admin analytics expose operational metadata and participant identities only. Room prompt and all conversation/contribution content are excluded by design.',

          generatedAt:
            new Date()
              .toISOString(),
        });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Admin] MirrorRoom metadata fetch failed:',
        error instanceof Error
          ? error.message
          : error
      );

      return res
        .status(500)
        .json({
          error:
            'MirrorRoom admin analytics could not be loaded.',

          code:
            'ADMIN_MIRRORROOM_ANALYTICS_FAILED',
        });
    }
  }
);

