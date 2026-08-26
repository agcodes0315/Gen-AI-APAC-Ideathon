import {
  initializeApp,
  getApps,
  type App,
} from 'firebase-admin/app';

import {
  getFirestore,
  type Firestore,
  FieldValue,
} from 'firebase-admin/firestore';

import { getAuth } from 'firebase-admin/auth';

import type {
  Request,
  Response,
  NextFunction,
} from 'express';

/**
 * MirrorTrace Firebase Admin configuration
 *
 * IMPORTANT:
 * Frontend and backend must use the SAME Firebase project.
 */
export const projectId =
  process.env.FIREBASE_PROJECT_ID || 'mirrortrace-9b161';

/**
 * MirrorTrace uses the standard Firestore default database.
 *
 * Do not use AI-Studio-generated database IDs here.
 */
export const databaseId = '(default)';

/**
 * Initialize Firebase Admin exactly once.
 *
 * On Google Cloud / Cloud Run, Application Default Credentials
 * are supplied by the runtime.
 */
const adminApp: App =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        projectId,
      });

/**
 * IMPORTANT:
 * Since MirrorTrace uses the normal `(default)` Firestore database,
 * use getFirestore(adminApp) without supplying a generated database ID.
 */
export const firestore: Firestore = getFirestore(adminApp);

export const adminAuth = getAuth(adminApp);

export { FieldValue };

/**
 * Safe startup diagnostics.
 * Never print credentials, tokens, journal content, or secrets.
 */
console.log('[Firebase Admin] initialized', {
  projectId,
  databaseId,
});

/**
 * Express request extended with server-verified Firebase identity.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Verifies Firebase ID Token server-side.
 *
 * NEVER trust a UID supplied by the browser.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith('Bearer ')
  ) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_HEADER_MISSING',
    });
    return;
  }

  const token = authHeader
    .slice('Bearer '.length)
    .trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_TOKEN_MISSING',
    });
    return;
  }

  try {
    const decodedToken =
      await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_UID_MISSING',
      });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (err: unknown) {
    const errorObj = err as {
      code?: string;
      message?: string;
      name?: string;
    };

    console.error(
      '[Firebase Auth] token verification failed',
      {
        name: errorObj?.name,
        code: errorObj?.code,
        message: errorObj?.message,
      }
    );

    res.status(401).json({
      error: 'Unauthorized',
      code: errorObj?.code || 'AUTH_TOKEN_INVALID',
    });
  }
}

/**
 * Owner-scoped Firestore helpers.
 */

export function getJournalsCollection(uid: string) {
  return firestore
    .collection('users')
    .doc(uid)
    .collection('journals');
}

export function getConversationsCollection(uid: string) {
  return firestore
    .collection('users')
    .doc(uid)
    .collection('conversations');
}

export function getMessagesCollection(
  uid: string,
  conversationId: string
) {
  return firestore
    .collection('users')
    .doc(uid)
    .collection('conversations')
    .doc(conversationId)
    .collection('messages');
}