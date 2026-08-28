import nodemailer, {
  type Transporter,
} from 'nodemailer';

export interface MirrorTraceEmailResult {
  messageId: string;

  accepted: string[];

  rejected: string[];
}

export interface PerspectiveWatchEmailInput {
  to: string;

  topic: string;

  appUrl?: string;
}

let cachedTransporter:
  Transporter | null =
  null;

function safeText(
  value: unknown,
  maxLength = 1000
): string {
  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  return value
    .trim()
    .slice(
      0,
      maxLength
    );
}

function requiredEnv(
  name: string
): string {
  const value =
    safeText(
      process.env[
        name
      ]
    );

  if (!value) {
    throw new Error(
      `Missing server environment variable: ${name}`
    );
  }

  return value;
}

function getSmtpPort():
  number {
  const value =
    Number(
      process.env
        .MIRRORTRACE_SMTP_PORT ||
        465
    );

  return Number.isFinite(
    value
  )
    ? value
    : 465;
}

function getSmtpSecure():
  boolean {
  const value =
    String(
      process.env
        .MIRRORTRACE_SMTP_SECURE ||
        'true'
    )
      .trim()
      .toLowerCase();

  return (
    value ===
      'true' ||
    value ===
      '1' ||
    value ===
      'yes'
  );
}

function getTransporter():
  Transporter {
  if (
    cachedTransporter
  ) {
    return cachedTransporter;
  }

  const host =
    requiredEnv(
      'MIRRORTRACE_SMTP_HOST'
    );

  const user =
    requiredEnv(
      'MIRRORTRACE_SMTP_USER'
    );

  const password =
    requiredEnv(
      'MIRRORTRACE_SMTP_PASSWORD'
    );

  cachedTransporter =
    nodemailer.createTransport({
      host,

      port:
        getSmtpPort(),

      secure:
        getSmtpSecure(),

      auth: {
        user,

        pass:
          password,
      },
    });

  return cachedTransporter;
}

export async function verifyEmailTransport():
  Promise<void> {
  const transporter =
    getTransporter();

  await transporter.verify();
}

export async function sendMirrorTraceEmail(
  params: {
    to: string;

    subject: string;

    text: string;

    html?: string;
  }
): Promise<MirrorTraceEmailResult> {
  const to =
    safeText(
      params.to,
      320
    );

  if (!to) {
    throw new Error(
      'Email recipient is required.'
    );
  }

  const subject =
    safeText(
      params.subject,
      200
    );

  const text =
    safeText(
      params.text,
      5000
    );

  const from =
    requiredEnv(
      'MIRRORTRACE_EMAIL_FROM'
    );

  const transporter =
    getTransporter();

  const result =
    await transporter.sendMail({
      from,

      to,

      subject,

      text,

      ...(params.html
        ? {
            html:
              params.html,
          }
        : {}),
    });

  return {
    messageId:
      String(
        result.messageId ||
          ''
      ),

    accepted:
      Array.isArray(
        result.accepted
      )
        ? result.accepted.map(
            String
          )
        : [],

    rejected:
      Array.isArray(
        result.rejected
      )
        ? result.rejected.map(
            String
          )
        : [],
  };
}

export async function sendPerspectiveWatchEmail(
  input:
    PerspectiveWatchEmailInput
): Promise<MirrorTraceEmailResult> {
  const topic =
    safeText(
      input.topic,
      160
    ) ||
    'Your perspective';

  const baseUrl =
    safeText(
      input.appUrl ||
        process.env
          .MIRRORTRACE_APP_URL ||
        process.env
          .APP_BASE_URL,
      500
    ) ||
    'http://localhost:3000';

  const subject =
    `MirrorTrace · Revisit ${topic}`;

  const text =
    [
      'A perspective you chose to revisit is ready.',
      '',
      `Topic: ${topic}`,
      '',
      'Open MirrorTrace to review the evidence, approved memory, and Thought Diff.',
      '',
      baseUrl,
      '',
      'MirrorTrace never includes your private journal text in reminder emails.',
    ].join(
      '\n'
    );

  const html =
    `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#202020;max-width:620px;margin:auto;">
        <h2 style="margin-bottom:8px;">
          MirrorTrace
        </h2>

        <p>
          A perspective you chose to revisit is ready.
        </p>

        <p>
          <strong>Topic:</strong>
          ${escapeHtml(topic)}
        </p>

        <p>
          Open MirrorTrace to review the evidence,
          approved memory, and Thought Diff.
        </p>

        <p style="margin:28px 0;">
          <a
            href="${escapeHtml(baseUrl)}"
            style="
              display:inline-block;
              background:#202020;
              color:#ffffff;
              text-decoration:none;
              padding:12px 18px;
              border-radius:8px;
              font-weight:600;
            "
          >
            Open MirrorTrace
          </a>
        </p>

        <p style="font-size:12px;color:#666;">
          For your privacy, reminder emails never include
          private journal text.
        </p>
      </div>
    `;

  return sendMirrorTraceEmail({
    to:
      input.to,

    subject,

    text,

    html,
  });
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}