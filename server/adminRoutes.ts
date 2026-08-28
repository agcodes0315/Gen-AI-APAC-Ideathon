import {
  Router,
} from 'express';

import {
  getAdminAuthContext,
  requireRole,
} from './adminRbac.ts';

import {
  changeUserAdminRole,
  getAdminOverview,
  listAdminAuditEvents,
  listAdminUsers,
  writeAdminAuditEvent,
} from './adminService.ts';

export const adminRouter =
  Router();

/* ============================================================
   DIAGNOSTIC ROUTE

   Deliberately contains no privileged information.
   Useful for confirming this router is mounted before Vite.
   ============================================================ */

adminRouter.get(
  '/api/admin/ping',
  (_req, res) => {
    res.status(
      200
    ).json({
      ok: true,
      service:
        'MirrorTrace Admin API',
      mounted: true,
    });
  }
);

/* ============================================================
   ADMIN OVERVIEW

   admin / super_admin
   ============================================================ */

adminRouter.get(
  '/api/admin/overview',

  requireRole(
    'admin'
  ),

  async (
    _req,
    res
  ) => {
    try {
      const context =
        getAdminAuthContext(
          res
        );

      const overview =
        await getAdminOverview(
          context
        );

      return res.status(
        200
      ).json({
        ok: true,
        overview,
      });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Admin] Overview failed:',
        error instanceof Error
          ? error.message
          : 'Unknown error'
      );

      return res.status(
        500
      ).json({
        error:
          'The admin overview could not be loaded.',

        code:
          'ADMIN_OVERVIEW_FAILED',
      });
    }
  }
);

/* ============================================================
   ADMIN USER METADATA

   admin / super_admin

   IMPORTANT:
   This returns account metadata only.
   It must never return journal content.
   ============================================================ */

adminRouter.get(
  '/api/admin/users',

  requireRole(
    'admin'
  ),

  async (
    req,
    res
  ) => {
    try {
      const rawLimit =
        typeof req.query
          .limit ===
        'string'
          ? Number(
              req.query
                .limit
            )
          : 50;

      const normalizedLimit =
        Number.isFinite(
          rawLimit
        )
          ? Math.floor(
              rawLimit
            )
          : 50;

      const limit =
        Math.max(
          1,
          Math.min(
            normalizedLimit,
            100
          )
        );

      const users =
        await listAdminUsers(
          limit
        );

      return res.status(
        200
      ).json({
        ok: true,
        users,
      });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Admin] User listing failed:',
        error instanceof Error
          ? error.message
          : 'Unknown error'
      );

      return res.status(
        500
      ).json({
        error:
          'The user overview could not be loaded.',

        code:
          'ADMIN_USERS_FAILED',
      });
    }
  }
);

/* ============================================================
   ADMIN AUDIT LOG

   admin / super_admin
   ============================================================ */

adminRouter.get(
  '/api/admin/audit',

  requireRole(
    'admin'
  ),

  async (
    req,
    res
  ) => {
    try {
      const rawLimit =
        typeof req.query
          .limit ===
        'string'
          ? Number(
              req.query
                .limit
            )
          : 50;

      const normalizedLimit =
        Number.isFinite(
          rawLimit
        )
          ? Math.floor(
              rawLimit
            )
          : 50;

      const limit =
        Math.max(
          1,
          Math.min(
            normalizedLimit,
            100
          )
        );

      const events =
        await listAdminAuditEvents(
          limit
        );

      return res.status(
        200
      ).json({
        ok: true,
        events,
      });
    } catch (
      error
    ) {
      console.error(
        '[MirrorTrace Admin] Audit listing failed:',
        error instanceof Error
          ? error.message
          : 'Unknown error'
      );

      return res.status(
        500
      ).json({
        error:
          'The admin audit log could not be loaded.',

        code:
          'ADMIN_AUDIT_FAILED',
      });
    }
  }
);

/* ============================================================
   ROLE MANAGEMENT

   super_admin only

   Supported transitions through the public admin API:
   user  <-> admin

   super_admin itself cannot be created through this endpoint.
   ============================================================ */

adminRouter.post(
  '/api/admin/users/:uid/role',

  requireRole(
    'super_admin'
  ),

  async (
    req,
    res
  ) => {
    const context =
      getAdminAuthContext(
        res
      );

    const targetUid =
      typeof req.params
        .uid ===
      'string'
        ? req.params
            .uid
            .trim()
        : '';

    const body =
      req.body &&
      typeof req.body ===
        'object'
        ? req.body
        : {};

    const requestedRole =
      'role' in body
        ? body.role
        : undefined;

    if (
      requestedRole !==
        'user' &&
      requestedRole !==
        'admin'
    ) {
      return res.status(
        400
      ).json({
        error:
          'Role must be either user or admin.',

        code:
          'INVALID_ROLE',
      });
    }

    if (
      !targetUid ||
      targetUid.length >
        256
    ) {
      return res.status(
        400
      ).json({
        error:
          'Invalid target user.',

        code:
          'INVALID_TARGET_UID',
      });
    }

    if (
      targetUid ===
      context.uid
    ) {
      return res.status(
        403
      ).json({
        error:
          'You cannot change your own administrative role.',

        code:
          'SELF_ROLE_CHANGE_DENIED',
      });
    }

    try {
      await changeUserAdminRole({
        actor:
          context,

        targetUid,

        newRole:
          requestedRole,
      });

      return res.status(
        200
      ).json({
        ok: true,

        message:
          'Role updated. The target user must refresh their Firebase ID token before the new role takes effect.',
      });
    } catch (
      error
    ) {
      const code =
        error instanceof Error
          ? error.message
          : 'UNKNOWN_ROLE_CHANGE_ERROR';

      try {
        await writeAdminAuditEvent({
          actingUid:
            context.uid,

          actingRole:
            context.role,

          action:
            'CHANGE_ADMIN_ROLE',

          targetResourceType:
            'firebase_user',

          targetIdentifier:
            targetUid,

          outcome:
            'failure',

          failureCategory:
            code,
        });
      } catch (
        auditError
      ) {
        console.error(
          '[MirrorTrace Admin] Failed to record rejected role mutation.',
          auditError instanceof Error
            ? auditError.message
            : 'Unknown audit error'
        );
      }

      if (
        code ===
        'SELF_ROLE_CHANGE_DENIED'
      ) {
        return res.status(
          403
        ).json({
          error:
            'You cannot change your own administrative role.',

          code,
        });
      }

      if (
        code ===
        'SUPER_ADMIN_REQUIRED'
      ) {
        return res.status(
          403
        ).json({
          error:
            'Super-admin permission is required.',

          code,
        });
      }

      if (
        code ===
        'INVALID_TARGET_UID'
      ) {
        return res.status(
          400
        ).json({
          error:
            'Invalid target user.',

          code,
        });
      }

      console.error(
        '[MirrorTrace Admin] Role change failed:',
        code
      );

      return res.status(
        500
      ).json({
        error:
          'The role could not be changed.',

        code:
          'ROLE_CHANGE_FAILED',
      });
    }
  }
);