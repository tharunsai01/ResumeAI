import bcrypt from 'bcryptjs';
import { User, CandidateProfile, RecruiterProfile, RefreshToken } from '../models';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, generateRefreshToken, hashToken } from '../utils/tokens';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';
import { OAuth2Client } from 'google-auth-library';
import { AuthToken } from '../models';       
import { generateOpaqueToken } from '../utils/tokens'; 
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';
import type { GoogleInput } from '../validators/auth.validators'; 
import { AuditLog } from '../models';

export function audit(
  actor: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: unknown,
  ip?: string,
) {
  return AuditLog.create({ actor, action, targetType, targetId, meta, ip });
}

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

type TokenType = 'email_verification' | 'password_reset';

const TOKEN_TTL_MS: Record<TokenType, number> = {
  email_verification: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

async function createAuthToken(userId: string, type: TokenType) {
  // Only the newest link works: delete any unused older ones
  await AuthToken.deleteMany({ user: userId, type, usedAt: { $exists: false } });
  const { raw, hash } = generateOpaqueToken();
  await AuthToken.create({
    user: userId,
    type,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
  });
  return raw;
}

// One atomic step: find a valid unused token AND mark it used
async function consumeAuthToken(raw: string, type: TokenType) {
  const token = await AuthToken.findOneAndUpdate(
    { tokenHash: hashToken(raw), type, usedAt: { $exists: false }, expiresAt: { $gt: new Date() } },
    { usedAt: new Date() },
  );
  if (!token) throw ApiError.badRequest('Invalid or expired link');
  return token;
}

async function createProfileFor(userId: string, role: string, companyName?: string) {
  if (role === 'candidate') await CandidateProfile.create({ user: userId });
  else await RecruiterProfile.create({ user: userId, companyName });
}

export async function sendVerification(user: { id: string; email: string; fullName: string }) {
  const raw = await createAuthToken(user.id, 'email_verification');
  await sendVerificationEmail(user.email, user.fullName, `${env.CLIENT_URL}/verify-email?token=${raw}`);
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
    await createProfileFor(user.id, input.role, input.companyName);
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  // Fire and forget: a mail outage shouldn't fail registration
  void sendVerification(user).catch((err) => console.error('Verification email failed:', err));

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput, meta: Meta) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status === 'suspended') throw ApiError.forbidden('This account has been suspended');

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
  if (user?.status === 'suspended') throw ApiError.unauthorized('Account suspended');
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

export async function verifyEmail(raw: string) {
  const token = await consumeAuthToken(raw, 'email_verification');
  await User.updateOne({ _id: token.user }, { isVerified: true });
}

export async function resendVerification(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isVerified) return;
  await sendVerification(user);
}

// Deliberately not async: the caller responds immediately, so timing never reveals if the email exists
export function forgotPassword(email: string) {
  void (async () => {
    const user = await User.findOne({ email });
    if (!user) return;
    const raw = await createAuthToken(user.id, 'password_reset');
    await sendPasswordResetEmail(user.email, user.fullName, `${env.CLIENT_URL}/reset-password?token=${raw}`);
  })().catch((err) => console.error('Password reset email failed:', err));
}

export async function resetPassword(raw: string, newPassword: string) {
  const token = await consumeAuthToken(raw, 'password_reset');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  // Having the reset email also proves the user owns the address
  await User.updateOne({ _id: token.user }, { passwordHash, isVerified: true });
  await RefreshToken.updateMany(
    { user: token.user, revokedAt: { $exists: false } },
    { revokedAt: new Date() },
  );
}

const googleClient = new OAuth2Client();

export async function googleAuth(input: GoogleInput, meta: Meta) {
  if (!env.GOOGLE_CLIENT_ID) throw new ApiError(503, 'Google sign-in is not configured');

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: input.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized('Invalid Google credential');
  }
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw ApiError.unauthorized('Google account email is not verified');
  }

  const email = payload.email.toLowerCase();
  let user = (await User.findOne({ googleId: payload.sub })) ?? (await User.findOne({ email }));

  if (user) {
    if (user.role === 'admin') throw ApiError.forbidden('Admin accounts must sign in with a password');
    if (user.status === 'suspended') throw ApiError.forbidden('This account has been suspended'); 
    if (!user.googleId) {
      // Linking to an existing account. If that account's email was never verified,
      // someone else may have registered it with their own password: wipe it.
      if (!user.isVerified) {
        await User.updateOne({ _id: user._id }, { $unset: { passwordHash: 1 } });
        await RefreshToken.updateMany(
          { user: user._id, revokedAt: { $exists: false } },
          { revokedAt: new Date() },
        );
      }
      user.googleId = payload.sub;
    }
    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    if (!input.role) {
      throw new ApiError(422, 'Choose a role to finish signing up', { code: 'ROLE_REQUIRED' });
    }
    if (input.role === 'recruiter' && !input.companyName) {
      throw new ApiError(422, 'Company name is required for recruiters', { code: 'COMPANY_REQUIRED' });
    }
    user = await User.create({
      fullName: payload.name ?? email.split('@')[0],
      email,
      googleId: payload.sub,
      role: input.role,
      isVerified: true,
    });
    try {
      await createProfileFor(user.id, input.role, input.companyName);
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }
  }

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}
