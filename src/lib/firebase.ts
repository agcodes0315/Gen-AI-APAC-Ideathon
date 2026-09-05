import {
  initializeApp,
  getApps,
  type FirebaseApp,
} from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

/**
 * Firebase Web configuration is intentionally public configuration.
 * Security is enforced through Firebase Auth, Firestore rules,
 * authenticated backend routes and server-side Admin SDK ownership checks.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyDd8QPtE2bm6WAjujzFTmawuAByjXpsXfQ',
  authDomain: 'mirrortrace-9b161.firebaseapp.com',
  projectId: 'mirrortrace-9b161',
  storageBucket: 'mirrortrace-9b161.firebasestorage.app',
  messagingSenderId: '840043864202',
  appId: '1:840043864202:web:330869c6f873ca46e4cd73',
};

const requiredConfig = {
  apiKey:
    firebaseConfig.apiKey,

  authDomain:
    firebaseConfig.authDomain,

  projectId:
    firebaseConfig.projectId,

  appId:
    firebaseConfig.appId,
};

for (
  const [
    key,
    value,
  ] of Object.entries(
    requiredConfig
  )
) {
  if (!value) {
    throw new Error(
      `Missing Firebase configuration: ${key}`
    );
  }
}

export const app:
  FirebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(
        firebaseConfig
      );

export const db:
  Firestore =
  getFirestore(app);

export const auth:
  Auth =
  getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt:
    'select_account',
});

export async function signInWithGoogle():
  Promise<User> {
  const result =
    await signInWithPopup(
      auth,
      googleProvider
    );

  return result.user;
}

export async function logOut():
  Promise<void> {
  await signOut(auth);
}

export async function getCurrentIdToken(
  forceRefresh = false
): Promise<string | null> {
  if (
    typeof auth.authStateReady ===
    'function'
  ) {
    await auth.authStateReady();
  }

  const user =
    auth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken(
    forceRefresh
  );
}