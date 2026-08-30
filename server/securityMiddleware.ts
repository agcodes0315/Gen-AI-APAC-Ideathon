import type { Express, NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

function setSecurityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const suppliedRequestId = req.get('x-request-id')?.trim();

  const requestId =
    suppliedRequestId && suppliedRequestId.length <= 128
      ? suppliedRequestId
      : crypto.randomUUID();

  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  res.setHeader(
    'Cross-Origin-Opener-Policy',
    'same-origin-allow-popups'
  );

  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
  }

  next();
}

export function applySecurityMiddleware(app: Express): void {
  app.disable('x-powered-by');
  app.use(setSecurityHeaders);
}
