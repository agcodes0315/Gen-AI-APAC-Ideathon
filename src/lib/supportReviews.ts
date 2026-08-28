import { getCurrentIdToken } from './firebase.ts';

export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ReviewState = 'pending' | 'approved' | 'hidden' | 'rejected';

export interface SupportTicket {
  id: string;
  ownerUid?: string;
  ownerEmail?: string | null;
  category: string;
  subject: string;
  message: string;
  status: SupportStatus;
  adminReply: string | null;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  ownerUid?: string;
  ownerEmail?: string | null;
  displayName?: string;
  rating: number;
  reviewText: string;
  allowPublic: boolean;
  moderationState: ReviewState;
  adminResponse?: string | null;
  createdAt: string;
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  authRequired = true
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (authRequired) {
    const token = await getCurrentIdToken();
    if (!token) throw new Error('Please sign in first.');
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  let data: any = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string'
        ? data.error
        : `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

export async function createSupportTicket(input: {
  category: string;
  subject: string;
  message: string;
}): Promise<void> {
  await apiFetch('/api/support/tickets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  const data = await apiFetch<{ tickets: SupportTicket[] }>('/api/support/tickets');
  return data.tickets ?? [];
}

export async function getAdminSupportTickets(): Promise<SupportTicket[]> {
  const data = await apiFetch<{ tickets: SupportTicket[] }>('/api/admin/support/tickets');
  return data.tickets ?? [];
}

export async function updateAdminSupportTicket(
  id: string,
  input: { status: SupportStatus; adminReply: string }
): Promise<void> {
  await apiFetch(`/api/admin/support/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function createReview(input: {
  rating: number;
  reviewText: string;
  allowPublic: boolean;
}): Promise<void> {
  await apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMyReviews(): Promise<ProductReview[]> {
  const data = await apiFetch<{ reviews: ProductReview[] }>('/api/reviews/mine');
  return data.reviews ?? [];
}

export async function getPublicReviews(): Promise<ProductReview[]> {
  const data = await apiFetch<{ reviews: ProductReview[] }>(
    '/api/reviews/public',
    {},
    false
  );
  return data.reviews ?? [];
}

export async function getAdminReviews(): Promise<ProductReview[]> {
  const data = await apiFetch<{ reviews: ProductReview[] }>('/api/admin/reviews');
  return data.reviews ?? [];
}

export async function moderateReview(
  id: string,
  input: { moderationState: ReviewState; adminResponse: string }
): Promise<void> {
  await apiFetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
