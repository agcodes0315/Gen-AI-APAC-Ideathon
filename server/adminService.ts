import { getAuth } from 'firebase-admin/auth';
import {
  FieldValue,
  getFirestore,
  type Query,
} from 'firebase-admin/firestore';

import type {
  AdminAuthContext,
  MirrorTraceRole,
} from './adminRbac.ts';

import './firebaseAdmin.ts';

const db = getFirestore();

export interface AdminHealthState {
  label: string;
  state:
    | 'healthy'
    | 'configured'
    | 'not_configured'
    | 'unknown'
    | 'error';
  detail?: string;
}

export interface AdminOverview {
  role: MirrorTraceRole;
  counts: {
    registeredUsers: number;
    thoughtSnapshots: number;
    thoughtDiffs: number;
    activePerspectiveWatches: number;
    pushDevices: number;
  };
  services: {
    firebaseAuth: AdminHealthState;
    firestore: AdminHealthState;
    gemini: AdminHealthState;
    smtp: AdminHealthState;
    fcm: AdminHealthState;
    scheduler: AdminHealthState;
  };
  generatedAt: string;
}

export interface AdminUserSummary {
  uid: string;
  email: string | null;
  role: MirrorTraceRole;
  disabled: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface AdminAuditEvent {
  id: string;
  actingUid: string;
  actingRole: MirrorTraceRole;
  action: string;
  targetResourceType: string;
  targetIdentifier?: string;
  outcome: 'success' | 'failure';
  failureCategory?: string;
  createdAt: string | null;
}

function normalizeRole(value: unknown): MirrorTraceRole {
  if (value === 'admin' || value === 'super_admin') return value;
  return 'user';
}

function maskEmail(email?: string): string | null {
  if (!email) return null;

  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';

  const visible =
    local.length <= 2
      ? local.slice(0, 1)
      : local.slice(0, 2);

  return `${visible}***@${domain}`;
}

function maskUid(uid: string): string {
  if (uid.length <= 10) return uid;
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

async function safeCount(query: Query): Promise<number> {
  try {
    const result = await query.count().get();
    return result.data().count;
  } catch (error) {
    console.error(
      '[MirrorTrace Admin] Aggregate count failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return 0;
  }
}

async function countRegisteredUsers(): Promise<number> {
  let total = 0;
  let pageToken: string | undefined;
  const MAX_USERS_TO_COUNT = 10_000;

  do {
    const remaining = MAX_USERS_TO_COUNT - total;
    if (remaining <= 0) break;

    const page = await getAuth().listUsers(
      Math.min(1000, remaining),
      pageToken
    );

    total += page.users.length;
    pageToken = page.pageToken;
  } while (pageToken);

  return total;
}

async function checkFirestore(): Promise<AdminHealthState> {
  try {
    await db.collection('_mirrortrace_healthcheck').limit(1).get();

    return {
      label: 'Firestore',
      state: 'healthy',
      detail: 'Backend database access succeeded.',
    };
  } catch {
    return {
      label: 'Firestore',
      state: 'error',
      detail: 'Backend database check failed.',
    };
  }
}

async function checkAuth(): Promise<AdminHealthState> {
  try {
    await getAuth().listUsers(1);

    return {
      label: 'Firebase Auth',
      state: 'healthy',
      detail: 'Firebase Admin authentication access succeeded.',
    };
  } catch {
    return {
      label: 'Firebase Auth',
      state: 'error',
      detail: 'Firebase Admin authentication check failed.',
    };
  }
}

function configuredHealth(
  label: string,
  configured: boolean,
  detail: string
): AdminHealthState {
  return configured
    ? {
        label,
        state: 'configured',
        detail,
      }
    : {
        label,
        state: 'not_configured',
        detail: `${label} configuration was not detected.`,
      };
}

async function schedulerHealth(): Promise<AdminHealthState> {
  try {
    const snapshot = await db
      .collection('systemMetrics')
      .doc('perspectiveWatchScheduler')
      .get();

    if (!snapshot.exists) {
      return configuredHealth(
        'Scheduler',
        Boolean(
          process.env.MIRRORTRACE_SCHEDULER_SECRET ||
            process.env.WATCH_PROCESSOR_SECRET
        ),
        'Scheduler authentication is configured. No heartbeat has been recorded yet.'
      );
    }

    const data = snapshot.data() ?? {};
    const lastRun =
      typeof data.lastRunAt === 'string'
        ? data.lastRunAt
        : null;

    return {
      label: 'Scheduler',
      state: 'healthy',
      detail: lastRun
        ? `Last recorded run: ${lastRun}`
        : 'Scheduler heartbeat document exists.',
    };
  } catch {
    return {
      label: 'Scheduler',
      state: 'unknown',
      detail: 'Scheduler status could not be determined.',
    };
  }
}

export async function getAdminOverview(
  context: AdminAuthContext
): Promise<AdminOverview> {
  const [
    registeredUsers,
    thoughtSnapshots,
    thoughtDiffs,
    activePerspectiveWatches,
    pushDevices,
    firebaseAuth,
    firestore,
    scheduler,
  ] = await Promise.all([
    countRegisteredUsers(),
    safeCount(db.collectionGroup('thoughtSnapshots')),
    safeCount(db.collectionGroup('thoughtDiffs')),
    safeCount(
      db
        .collection('perspectiveWatchQueue')
        .where('status', 'in', ['scheduled', 'due'])
    ),
    safeCount(db.collectionGroup('pushDevices')),
    checkAuth(),
    checkFirestore(),
    schedulerHealth(),
  ]);

  return {
    role: context.role,
    counts: {
      registeredUsers,
      thoughtSnapshots,
      thoughtDiffs,
      activePerspectiveWatches,
      pushDevices,
    },
    services: {
      firebaseAuth,
      firestore,
      gemini: configuredHealth(
        'Gemini',
        Boolean(process.env.GEMINI_API_KEY),
        'Gemini server credential is configured.'
      ),
      smtp: configuredHealth(
        'SMTP',
        Boolean(
          process.env.MIRRORTRACE_SMTP_HOST &&
            process.env.MIRRORTRACE_SMTP_USER &&
            process.env.MIRRORTRACE_SMTP_PASSWORD
        ),
        'MirrorTrace SMTP configuration is available server-side.'
      ),
      fcm: configuredHealth(
        'FCM',
        Boolean(
          process.env.FIREBASE_PROJECT_ID ||
            process.env.GCLOUD_PROJECT ||
            process.env.GOOGLE_CLOUD_PROJECT
        ),
        'Firebase Admin project configuration is available.'
      ),
      scheduler,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function listAdminUsers(
  limit = 50
): Promise<AdminUserSummary[]> {
  const safeLimit = Math.max(
    1,
    Math.min(Math.floor(limit), 100)
  );

  const result = await getAuth().listUsers(safeLimit);

  return result.users.map((user) => ({
    uid: maskUid(user.uid),
    email: maskEmail(user.email),
    role: normalizeRole(user.customClaims?.role),
    disabled: user.disabled,
    createdAt: user.metadata.creationTime ?? null,
    lastSignInAt: user.metadata.lastSignInTime ?? null,
  }));
}

export async function writeAdminAuditEvent(input: {
  actingUid: string;
  actingRole: MirrorTraceRole;
  action: string;
  targetResourceType: string;
  targetIdentifier?: string;
  outcome: 'success' | 'failure';
  failureCategory?: string;
}): Promise<void> {
  const payload = {
    actingUid: input.actingUid,
    actingRole: input.actingRole,
    action: input.action,
    targetResourceType: input.targetResourceType,
    outcome: input.outcome,
    createdAt: FieldValue.serverTimestamp(),
    ...(input.targetIdentifier
      ? { targetIdentifier: input.targetIdentifier }
      : {}),
    ...(input.failureCategory
      ? { failureCategory: input.failureCategory }
      : {}),
  };

  await db.collection('adminAuditLogs').add(payload);
}

export async function listAdminAuditEvents(
  limit = 50
): Promise<AdminAuditEvent[]> {
  const safeLimit = Math.max(
    1,
    Math.min(Math.floor(limit), 100)
  );

  const snapshot = await db
    .collection('adminAuditLogs')
    .orderBy('createdAt', 'desc')
    .limit(safeLimit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const timestamp = data.createdAt;

    const createdAt =
      timestamp &&
      typeof timestamp.toDate === 'function'
        ? timestamp.toDate().toISOString()
        : null;

    return {
      id: doc.id,
      actingUid:
        typeof data.actingUid === 'string'
          ? maskUid(data.actingUid)
          : 'unknown',
      actingRole: normalizeRole(data.actingRole),
      action:
        typeof data.action === 'string'
          ? data.action
          : 'UNKNOWN_ACTION',
      targetResourceType:
        typeof data.targetResourceType === 'string'
          ? data.targetResourceType
          : 'unknown',
      targetIdentifier:
        typeof data.targetIdentifier === 'string'
          ? maskUid(data.targetIdentifier)
          : undefined,
      outcome:
        data.outcome === 'failure'
          ? 'failure'
          : 'success',
      failureCategory:
        typeof data.failureCategory === 'string'
          ? data.failureCategory
          : undefined,
      createdAt,
    };
  });
}

export async function changeUserAdminRole(input: {
  actor: AdminAuthContext;
  targetUid: string;
  newRole: 'user' | 'admin';
}): Promise<void> {
  const { actor, targetUid, newRole } = input;

  if (actor.role !== 'super_admin') {
    throw new Error('SUPER_ADMIN_REQUIRED');
  }

  if (!targetUid.trim()) {
    throw new Error('INVALID_TARGET_UID');
  }

  if (targetUid === actor.uid) {
    throw new Error('SELF_ROLE_CHANGE_DENIED');
  }

  const targetUser = await getAuth().getUser(targetUid);
  const existingClaims = targetUser.customClaims ?? {};

  await getAuth().setCustomUserClaims(targetUid, {
    ...existingClaims,
    role: newRole,
  });

  await writeAdminAuditEvent({
    actingUid: actor.uid,
    actingRole: actor.role,
    action:
      newRole === 'admin'
        ? 'ASSIGN_ADMIN_ROLE'
        : 'REVOKE_ADMIN_ROLE',
    targetResourceType: 'firebase_user',
    targetIdentifier: targetUid,
    outcome: 'success',
  });
}
