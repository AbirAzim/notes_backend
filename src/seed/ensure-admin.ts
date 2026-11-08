import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';

export async function ensureAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.log(
      JSON.stringify({
        event: 'admin_seed_skipped',
        reason: 'ADMIN_EMAIL or ADMIN_PASSWORD not set',
      }),
    );
    return;
  }

  const email = env.ADMIN_EMAIL.toLowerCase();
  if (await User.exists({ email })) {
    console.log(
      JSON.stringify({ event: 'admin_seed_skipped', reason: 'email already exists', email }),
    );
    return;
  }

  await User.create({
    name: 'Admin',
    email,
    password: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
    role: 'ADMIN',
    emailVerified: true,
  });

  console.log(JSON.stringify({ event: 'admin_seeded', email }));
}
