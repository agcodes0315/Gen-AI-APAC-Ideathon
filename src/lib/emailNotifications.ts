import {
  getCurrentIdToken,
} from './firebase.ts';

export interface EmailStatus {
  configured: boolean;
}

export interface EmailTestResult {
  success: boolean;

  messageId?: string;

  accepted?: number;

  rejected?: number;
}

async function authenticatedEmailRequest(
  url: string,
  options:
    RequestInit = {}
): Promise<
  Record<
    string,
    unknown
  >
> {
  const token =
    await getCurrentIdToken();

  if (!token) {
    throw new Error(
      'Please sign in before managing email reminders.'
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
    options.body
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

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok
  ) {
    const payload =
      data as Record<
        string,
        unknown
      >;

    throw new Error(
      String(
        payload.message ||
          payload.error ||
          'Email request failed.'
      )
    );
  }

  return data as Record<
    string,
    unknown
  >;
}

export async function getEmailStatus():
  Promise<EmailStatus> {
  const data =
    await authenticatedEmailRequest(
      '/api/notifications/email/status',
      {
        method:
          'GET',
      }
    );

  return {
    configured:
      Boolean(
        data.configured
      ),
  };
}

export async function verifyEmailConnection():
  Promise<void> {
  await authenticatedEmailRequest(
    '/api/notifications/email/verify',
    {
      method:
        'POST',
    }
  );
}

export async function sendTestEmail():
  Promise<EmailTestResult> {
  const data =
    await authenticatedEmailRequest(
      '/api/notifications/email/test',
      {
        method:
          'POST',
      }
    );

  return {
    success:
      Boolean(
        data.success
      ),

    messageId:
      typeof data.messageId ===
      'string'
        ? data.messageId
        : undefined,

    accepted:
      Number(
        data.accepted ||
          0
      ),

    rejected:
      Number(
        data.rejected ||
          0
      ),
  };
}