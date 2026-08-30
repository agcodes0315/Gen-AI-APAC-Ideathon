type RuntimeSummary = {
  nodeEnv: string;
  port: number;
  firebaseProjectConfigured: boolean;
  geminiConfigured: boolean;
  smtpConfigured: boolean;
  schedulerConfigured: boolean;
  appUrlConfigured: boolean;
};

function hasValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function getFirebaseProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    ''
  ).trim();
}

export function getSafeRuntimeSummary(): RuntimeSummary {
  const smtpConfigured =
    hasValue(process.env.MIRRORTRACE_SMTP_HOST) &&
    hasValue(process.env.MIRRORTRACE_SMTP_PORT) &&
    hasValue(process.env.MIRRORTRACE_SMTP_USER) &&
    hasValue(process.env.MIRRORTRACE_SMTP_PASSWORD);

  const schedulerConfigured =
    hasValue(process.env.WATCH_PROCESSOR_SECRET) ||
    hasValue(process.env.MIRRORTRACE_SCHEDULER_SECRET);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    firebaseProjectConfigured: hasValue(getFirebaseProjectId()),
    geminiConfigured: hasValue(process.env.GEMINI_API_KEY),
    smtpConfigured,
    schedulerConfigured,
    appUrlConfigured: hasValue(process.env.MIRRORTRACE_APP_URL),
  };
}

export function assertProductionRuntimeConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];

  if (!hasValue(getFirebaseProjectId())) {
    missing.push(
      'FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT / GCLOUD_PROJECT)'
    );
  }

  if (!hasValue(process.env.GEMINI_API_KEY)) {
    missing.push('GEMINI_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `[MirrorTrace] Refusing to start production with missing required configuration: ${missing.join(', ')}`
    );
  }
}
