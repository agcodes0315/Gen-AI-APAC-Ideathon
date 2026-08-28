import { getAuth } from 'firebase-admin/auth';
import '../server/firebaseAdmin.ts';

async function main(): Promise<void> {
  const identifier = process.argv[2]?.trim();

  if (!identifier) {
    console.error(
      'Usage: npx tsx scripts/bootstrapAdmin.ts <firebase-user-email-or-uid>'
    );

    process.exitCode = 1;
    return;
  }

  let user;

  try {
    user = identifier.includes('@')
      ? await getAuth().getUserByEmail(identifier)
      : await getAuth().getUser(identifier);
  } catch {
    console.error('Firebase user was not found.');
    process.exitCode = 1;
    return;
  }

  const existingClaims = user.customClaims ?? {};

  await getAuth().setCustomUserClaims(
    user.uid,
    {
      ...existingClaims,
      role: 'super_admin',
    }
  );

  console.log(
    `Super-admin role assigned to UID ${user.uid}.`
  );

  console.log(
    'Sign out and sign back in, or force-refresh the Firebase ID token, before testing admin access.'
  );
}

void main();
