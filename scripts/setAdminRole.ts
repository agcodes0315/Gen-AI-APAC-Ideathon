import { getAuth } from 'firebase-admin/auth';
import '../server/firebaseAdmin.ts';

type AllowedRole = 'user' | 'admin' | 'super_admin';
const allowedRoles: AllowedRole[] = ['user', 'admin', 'super_admin'];

async function main(): Promise<void> {
  const identifier = process.argv[2]?.trim();
  const role = process.argv[3]?.trim() as AllowedRole | undefined;

  if (!identifier || !role || !allowedRoles.includes(role)) {
    console.error(
      'Usage: npx tsx scripts/setAdminRole.ts <email-or-uid> <user|admin|super_admin>'
    );
    process.exitCode = 1;
    return;
  }

  const auth = getAuth();

  const user = identifier.includes('@')
    ? await auth.getUserByEmail(identifier)
    : await auth.getUser(identifier);

  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims ?? {}),
    role,
  });

  console.log(`Role "${role}" assigned to UID ${user.uid}.`);
  console.log('Sign out and sign back in for the new claim to take effect.');
}

void main();
