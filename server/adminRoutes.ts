import {
  Router,
} from 'express';

import {
  getAdminAuthContext,
  requireRole,
} from './adminRbac.ts';

import {
  getAdminOverview,
  listAdminAuditEvents,
  listAdminUsers,
} from './adminService.ts';

export const adminRouter =
  Router();

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

/**
 * Disabled on purpose.
 * MirrorTrace currently has one fixed Control Room owner.
 */
adminRouter.post(
  '/api/admin/users/:uid/role',

  requireRole(
    'super_admin'
  ),

  async (
    _req,
    res
  ) => {
    return res.status(
      403
    ).json({
      error:
        'Administrative role changes are disabled. MirrorTrace currently uses a single allowlisted Control Room owner.',

      code:
        'ROLE_MANAGEMENT_DISABLED',
    });
  }
);
