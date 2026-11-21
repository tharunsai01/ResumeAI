import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models';
import { password as passwordRule } from '../validators/auth.validators';

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(' ');
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!email || !fullName || !rawPassword) {
    console.error('Usage: ADMIN_PASSWORD=... npm run create-admin -- <email> "<Full Name>"');
    process.exit(1);
  }

  const pwd = passwordRule.safeParse(rawPassword);
  if (!pwd.success) {
    console.error('Weak password:', pwd.error.issues.map((i) => i.message).join(', '));
    process.exit(1);
  }

  await connectDB();

  const normalized = email.trim().toLowerCase();
  if (await User.exists({ email: normalized })) {
    console.error('A user with that email already exists. Nothing changed.');
    await disconnectDB();
    process.exit(1);
  }

  await User.create({
    fullName,
    email: normalized,
    passwordHash: await bcrypt.hash(pwd.data, 12),
    role: 'admin',
    isVerified: true,
  });

  console.log(`Admin created: ${normalized}`);
  await disconnectDB();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
