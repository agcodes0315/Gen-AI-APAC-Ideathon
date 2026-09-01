import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import {
  getAuth,
} from 'firebase-admin/auth';

import './firebaseAdmin.ts';

/* ============================================================
   MIRRORTRACE — OWNER-ONLY CONTROL ROOM RBAC
   ============================================================ */

export const MIRRORTRACE_ROLES = [
  'user',
  'admin',
  'super_admin',
] as const;

export type MirrorTraceRole =
  (typeof MIRRORTRACE_ROLES)[number];

export interface AdminAuthContext {
  uid: string;
  role: MirrorTraceRole;
  email?: string;
}

const CONTROL_ROOM_OWNER_EMAIL =
  'agrimalko@gmail.com';

const ROLE_LEVEL: Record<
  MirrorTraceRole,
  number
> = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

function normalizeEmail(
  value: unknown
): string {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : '';
}

function extractBearerToken(
  req: Request
): string | null {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    typeof authorization !== 'string'
  ) {
    return null;
  }

  const parts =
    authorization.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== 'bearer' ||
    !parts[1]
  ) {
    return null;
  }

  return parts[1].trim();
}

export async function resolveVerifiedAuthContext(
  req: Request
): Promise<AdminAuthContext | null> {
  const token =
    extractBearerToken(req);

  if (!token) {
    return null;
  }

  try {
    const decoded =
      await getAuth().verifyIdToken(
        token,
        true
      );

    const email =
      normalizeEmail(
        decoded.email
      );

    const emailVerified =
      decoded.email_verified === true;

    /*
     * IMPORTANT:
     * We deliberately IGNORE any old `role` custom claim here.
     * The owner email is the only source of Control Room privilege.
     */
    const isOwner =
      emailVerified &&
      email ===
        CONTROL_ROOM_OWNER_EMAIL;

    return {
      uid:
        decoded.uid,

      role:
        isOwner
          ? 'super_admin'
          : 'user',

      email:
        email || undefined,
    };
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace RBAC] Token verification failed.',
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown authentication error',
      }
    );

    return null;
  }
}

export function requireRole(
  minimumRole: MirrorTraceRole
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    void (async () => {
      const context =
        await resolveVerifiedAuthContext(
          req
        );

      if (!context) {
        res.status(
          401
        ).json({
          error:
            'Authentication required.',
          code:
            'AUTH_REQUIRED',
        });

        return;
      }

      const currentLevel =
        ROLE_LEVEL[
          context.role
        ];

      const requiredLevel =
        ROLE_LEVEL[
          minimumRole
        ];

      if (
        currentLevel <
        requiredLevel
      ) {
        console.warn(
          '[MirrorTrace RBAC] Control Room access denied.',
          {
            uid:
              context.uid,
            email:
              context.email ?? null,
            role:
              context.role,
            requiredRole:
              minimumRole,
            path:
              req.path,
          }
        );

        res.status(
          403
        ).json({
          error:
            'This account does not have access to the MirrorTrace Control Room.',
          code:
            'CONTROL_ROOM_ACCESS_DENIED',
        });

        return;
      }

      res.locals.authContext =
        context;

      next();
    })();
  };
}

export function getAdminAuthContext(
  res: Response
): AdminAuthContext {
  const context =
    res.locals.authContext as
      | AdminAuthContext
      | undefined;

  if (!context) {
    throw new Error(
      'Admin authentication context was not initialized.'
    );
  }

  return context;
}
