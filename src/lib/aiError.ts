export type ApiLikeError = {
  status?: number;
  code?: string;
  message?: string;
};

/**
 * Converts an AI/network/API failure into a user-safe message.
 *
 * Important:
 * - This does not expose billing details, API keys, provider internals,
 *   or raw server stack traces to the UI.
 * - A journal entry or already-approved memory remains valid even when
 *   a new Gemini generation temporarily fails.
 */
export function getAiGenerationError(
  error: unknown,
  fallback =
    'AI generation is temporarily unavailable. Please try again later.'
): string {
  const candidate =
    (
      typeof error === 'object' &&
      error !== null
    )
      ? error as ApiLikeError
      : {};

  const status =
    typeof candidate.status ===
    'number'
      ? candidate.status
      : undefined;

  const code =
    typeof candidate.code ===
    'string'
      ? candidate.code
          .trim()
          .toUpperCase()
      : '';

  const message =
    typeof candidate.message ===
    'string'
      ? candidate.message.trim()
      : '';

  const normalizedMessage =
    message.toLowerCase();

  const looksLikeQuotaOrBilling =
    normalizedMessage.includes(
      'resource_exhausted'
    ) ||
    normalizedMessage.includes(
      'resource exhausted'
    ) ||
    normalizedMessage.includes(
      'quota'
    ) ||
    normalizedMessage.includes(
      'credit'
    ) ||
    normalizedMessage.includes(
      'billing'
    ) ||
    normalizedMessage.includes(
      'rate limit'
    ) ||
    normalizedMessage.includes(
      'too many requests'
    );

  const looksLikeTemporaryProviderFailure =
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    code.includes(
      'RESOURCE_EXHAUSTED'
    ) ||
    code.includes(
      'AI_UNAVAILABLE'
    ) ||
    code.includes(
      'GEMINI'
    );

  if (
    looksLikeQuotaOrBilling ||
    looksLikeTemporaryProviderFailure
  ) {
    return (
      'AI generation is temporarily unavailable. ' +
      'Your saved reflection is safe. Please try again later.'
    );
  }

  if (
    status === 401
  ) {
    return (
      'Your session could not be verified. ' +
      'Please sign in again and retry.'
    );
  }

  if (
    status === 403
  ) {
    return (
      'You do not have permission to perform this AI action.'
    );
  }

  if (
    status === 404
  ) {
    return (
      'MirrorTrace could not find the saved source record for this AI action.'
    );
  }

  if (message) {
    return message;
  }

  return fallback;
}
