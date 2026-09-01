import {
  getCurrentIdToken,
} from './firebase.ts';

export type AdminRole =
  | 'user'
  | 'admin'
  | 'super_admin';

export type HealthState =
  | 'healthy'
  | 'configured'
  | 'not_configured'
  | 'unknown'
  | 'error';

export interface ServiceHealth {
  label: string;
  state: HealthState;
  detail?: string;
}

export interface AdminOverview {
  role: AdminRole;

  counts: {
    registeredUsers: number;
    thoughtSnapshots: number;
    thoughtDiffs: number;
    activePerspectiveWatches: number;
    pushDevices: number;
  };

  services: {
    firebaseAuth: ServiceHealth;
    firestore: ServiceHealth;
    gemini: ServiceHealth;
    smtp: ServiceHealth;
    fcm: ServiceHealth;
    scheduler: ServiceHealth;
  };

  generatedAt: string;
}

export interface AdminUserSummary {
  uid: string;
  email: string | null;
  role: AdminRole;
  disabled: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface AdminAuditEvent {
  id: string;
  actingUid: string;
  actingRole: AdminRole;
  action: string;
  targetResourceType: string;
  targetIdentifier?: string;
  outcome:
    | 'success'
    | 'failure';
  failureCategory?: string;
  createdAt: string | null;
}

export class AdminApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string
  ) {
    super(
      message
    );

    this.name =
      'AdminApiError';

    this.status =
      status;

    this.code =
      code;
  }
}

async function adminFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new AdminApiError(
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

  headers.set(
    'Cache-Control',
    'no-cache'
  );

  if (
    options.body &&
    typeof options.body ===
      'string'
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          ...options,
          headers,
          cache:
            'no-store',
        }
      );
  } catch (
    error
  ) {
    throw new AdminApiError(
      'Could not reach the MirrorTrace backend.',
      0,
      'NETWORK_ERROR'
    );
  }

  let data:
    | Record<
        string,
        unknown
      >
    | null =
      null;

  try {
    const parsed =
      await response.json();

    if (
      parsed &&
      typeof parsed ===
        'object'
    ) {
      data =
        parsed as Record<
          string,
          unknown
        >;
    }
  } catch {
    data =
      null;
  }

  if (
    !response.ok
  ) {
    const message =
      typeof data?.message ===
      'string'
        ? data.message
        : typeof data?.error ===
            'string'
          ? data.error
          : `Request failed with status ${response.status}.`;

    const code =
      typeof data?.code ===
      'string'
        ? data.code
        : undefined;

    throw new AdminApiError(
      message,
      response.status,
      code
    );
  }

  if (!data) {
    throw new AdminApiError(
      'The backend returned an unexpected response.',
      response.status,
      'INVALID_RESPONSE'
    );
  }

  return data as T;
}

export async function getAdminOverview():
Promise<AdminOverview> {
  const response =
    await adminFetch<{
      ok: true;
      overview: AdminOverview;
    }>(
      '/api/admin/overview'
    );

  if (
    !response.overview
  ) {
    throw new AdminApiError(
      'Admin overview was missing from the backend response.',
      500,
      'INVALID_ADMIN_OVERVIEW'
    );
  }

  return response.overview;
}

export async function getAdminUsers():
Promise<AdminUserSummary[]> {
  const response =
    await adminFetch<{
      ok: true;
      users: AdminUserSummary[];
    }>(
      '/api/admin/users?limit=50'
    );

  return Array.isArray(
    response.users
  )
    ? response.users
    : [];
}

export async function getAdminAudit():
Promise<AdminAuditEvent[]> {
  const response =
    await adminFetch<{
      ok: true;
      events: AdminAuditEvent[];
    }>(
      '/api/admin/audit?limit=50'
    );

  return Array.isArray(
    response.events
  )
    ? response.events
    : [];
}
