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
   MIRRORTRACE RBAC
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

/**
 * Privilege ordering.
 *
 * user        = normal owner-bound access
 * admin       = operational/admin dashboard
 * super_admin = admin + role management
 */
const ROLE_LEVEL: Record<
  MirrorTraceRole,
  number
> = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

/* ============================================================
   ROLE NORMALIZATION
   ============================================================ */

function normalizeRole(
  value: unknown
): MirrorTraceRole {
  if (
    value === 'admin' ||
    value === 'super_admin' ||
    value === 'user'
  ) {
    return value;
  }

  // Fail closed.
  return 'user';
}

/* ============================================================
   BEARER TOKEN EXTRACTION
   ============================================================ */

function extractBearerToken(
  req: Request
): string | null {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    typeof authorization !==
      'string'
  ) {
    return null;
  }

  const parts =
    authorization
      .trim()
      .split(/\s+/);

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const [
    scheme,
    token,
  ] = parts;

  if (
    scheme.toLowerCase() !==
      'bearer' ||
    !token ||
    token.trim().length === 0
  ) {
    return null;
  }

  return token.trim();
}

/* ============================================================
   FIREBASE TOKEN VERIFICATION
   ============================================================ */

export async function resolveVerifiedAuthContext(
  req: Request
): Promise<AdminAuthContext | null> {
  const token =
    extractBearerToken(req);

  if (!token) {
    return null;
  }

  try {
    /**
     * checkRevoked=true is intentional because these
     * are privileged administrative routes.
     */
    const decoded =
      await getAuth().verifyIdToken(
        token,
        true
      );

    const role =
      normalizeRole(
        decoded.role
      );

    return {
      uid:
        decoded.uid,

      role,

      email:
        typeof decoded.email ===
        'string'
          ? decoded.email
          : undefined,
    };
  } catch (
    error
  ) {
    console.warn(
      '[MirrorTrace RBAC] Firebase token verification rejected.',
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

/* ============================================================
   ROLE MIDDLEWARE
   ============================================================ */

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
          '[MirrorTrace RBAC] Administrative access denied.',
          {
            uid:
              context.uid,
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
            'You do not have permission to access this resource.',

          code:
            'ADMIN_PERMISSION_REQUIRED',
        });

        return;
      }

      res.locals.authContext =
        context;

      next();
    })();
  };
}

/* ============================================================
   CONTEXT ACCESSOR
   ============================================================ */

export function getAdminAuthContext(
  res: Response
): AdminAuthContext {
  const context =
    res.locals
      .authContext as
      | AdminAuthContext
      | undefined;

  if (!context) {
    throw new Error(
      'Admin authentication context was not initialized.'
    );
  }

  return context;
}