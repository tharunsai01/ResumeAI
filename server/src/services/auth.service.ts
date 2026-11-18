import bcrypt from 'bcryptjs';
import { User, CandidateProfile, RecruiterProfile, RefreshToken } from '../models';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, generateRefreshToken, hashToken } from '../utils/tokens';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

interface Meta {
  ip?: string;
  userAgent?: string;
}

// Compared against when the email doesn't exist, so response time doesn't reveal it
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);

const refreshExpiry = () => new Date(Date.now() + env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000);

export function publicUser(user: { id: string; fullName: string; email: string; role: string; isVerified: boolean }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

async function issueTokens(user: { id: string; role: string }, meta: Meta) {
  const accessToken = signAccessToken(user.id, user.role);
  const { raw, hash } = generateRefreshToken();
  await RefreshToken.create({ user: user.id, tokenHash: hash, expiresAt: refreshExpiry(), ...meta });
  return { accessToken, refreshToken: raw };
}

export async function register(input: RegisterInput, meta: Meta) {
  if (await User.exists({ email: input.email })) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  try {
    if (input.role === 'candidate') {
      await CandidateProfile.create({ user: user._id });
    } else {
      await RecruiterProfile.create({ user: user._id, companyName: input.companyName });
    }
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // don't leave a user without a profile
    throw err;
  }

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput, meta: Meta) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function refresh(rawToken: string | undefined, meta: Meta) {
  if (!rawToken) throw ApiError.unauthorized('Missing refresh token');

  const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
  if (!stored) throw ApiError.unauthorized('Invalid refresh token');

  if (stored.revokedAt) {
    // An already-used token came back: assume theft and kill every session for this user
    await RefreshToken.updateMany(
      { user: stored.user, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    throw ApiError.unauthorized('Session expired, please log in again');
  }

  if (stored.expiresAt < new Date()) throw ApiError.unauthorized('Session expired, please log in again');

  const user = await User.findById(stored.user);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const tokens = await issueTokens(user, meta);
  stored.revokedAt = new Date();
  stored.replacedByHash = hashToken(tokens.refreshToken);
  await stored.save();

  return { user: publicUser(user), ...tokens };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: { $exists: false } },
    { revokedAt: new Date() },
  );
}
