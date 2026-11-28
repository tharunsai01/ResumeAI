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
import { recordAuditLog } from './audit.service';
import type { GoogleInput, LinkedInInput } from '../validators/auth.validators'; 

interface Meta {
  ip?: string;
  userAgent?: string;
}

// Compared against when the email doesn't exist, so response time doesn't reveal it
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);

const refreshExpiry = () => new Date(Date.now() + env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000);

export function publicUser(user: { id: string; fullName: string; email: string; role: string; isVerified: boolean; authProvider?: string | null; avatarUrl?: string | null }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    authProvider: user.authProvider || 'local',
    avatarUrl: user.avatarUrl || null,
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

  void recordAuditLog({
    action: 'AUTH_REGISTER',
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
    status: 'success',
  });

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput, meta: Meta) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.passwordHash || !ok) {
    void recordAuditLog({
      action: 'AUTH_LOGIN_FAILED',
      actorEmail: input.email,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      status: 'failure',
      errorMessage: 'Invalid credentials',
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'suspended') {
    void recordAuditLog({
      action: 'AUTH_LOGIN_BLOCKED_SUSPENDED',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      status: 'failure',
      errorMessage: 'Account suspended',
    });
    throw ApiError.forbidden('Your account has been suspended. Please contact support.');
  }

  if (user.status === 'inactive') {
    void recordAuditLog({
      action: 'AUTH_LOGIN_BLOCKED_INACTIVE',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      status: 'failure',
      errorMessage: 'Account inactive',
    });
    throw ApiError.forbidden('Your account is deactivated. Please contact support.');
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  const tokens = await issueTokens(user, meta);

  void recordAuditLog({
    action: 'AUTH_LOGIN',
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
    status: 'success',
  });

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
  if (user.status !== 'active') throw ApiError.forbidden('This account is no longer active');

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

export async function updateUserProfile(userId: string, data: { fullName?: string }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (data.fullName) user.fullName = data.fullName.trim();
  await user.save();

  void recordAuditLog({
    action: 'USER_PROFILE_UPDATE',
    actorId: userId,
    targetType: 'User',
    targetId: userId,
    status: 'success',
  });

  return publicUser(user);
}

export async function changePassword(userId: string, currentPass: string, newPass: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.passwordHash) throw ApiError.unauthorized('User not found');
  const ok = await bcrypt.compare(currentPass, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');
  user.passwordHash = await bcrypt.hash(newPass, 12);
  await user.save();

  void recordAuditLog({
    action: 'USER_PASSWORD_CHANGE',
    actorId: userId,
    targetType: 'User',
    targetId: userId,
    status: 'success',
  });

  return { message: 'Password changed successfully' };
}

const googleClient = new OAuth2Client();

export async function getGoogleAuthUrl(role = 'candidate', redirectUri?: string) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new ApiError(503, 'Google sign-in is not configured');
  }
  const callbackUri = redirectUri || env.GOOGLE_REDIRECT_URI || `${env.CLIENT_URL}/oauth/callback`;
  const state = Buffer.from(JSON.stringify({ role, provider: 'google', nonce: Date.now() })).toString('base64url');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUri,
    state,
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getLinkedInAuthUrl(role = 'candidate', redirectUri?: string) {
  if (!env.LINKEDIN_CLIENT_ID) {
    throw new ApiError(503, 'LinkedIn sign-in is not configured. Please set LINKEDIN_CLIENT_ID in backend/.env');
  }
  const callbackUri = redirectUri || env.LINKEDIN_REDIRECT_URI || `${env.CLIENT_URL}/oauth/callback`;
  const state = Buffer.from(JSON.stringify({ role, provider: 'linkedin', nonce: Date.now() })).toString('base64url');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: callbackUri,
    state,
    scope: 'openid profile email',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

interface OAuthUserProfile {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'linkedin';
  role?: 'candidate' | 'recruiter';
  companyName?: string;
  meta: Meta;
}

async function handleOAuthUser(params: OAuthUserProfile) {
  const { sub, email, name, avatarUrl, provider, role, companyName, meta } = params;

  const idQuery = provider === 'google' ? { googleId: sub } : { linkedinId: sub };
  let user = (await User.findOne(idQuery)) ?? (await User.findOne({ email }));

  if (user) {
    if (user.status === 'suspended') {
      throw new ApiError(403, 'Account is suspended. Please contact support.');
    }
    if (provider === 'google' && !user.googleId) {
      user.googleId = sub;
      user.authProvider = 'google';
    } else if (provider === 'linkedin' && !user.linkedinId) {
      user.linkedinId = sub;
      user.authProvider = 'linkedin';
    }
    // Synchronize latest profile name and avatar from Google / OAuth provider
    if (name && (user.fullName !== name || user.fullName === 'Google Verified User' || !user.fullName)) {
      user.fullName = name;
    }
    if (avatarUrl && (!user.avatarUrl || user.avatarUrl !== avatarUrl)) {
      user.avatarUrl = avatarUrl;
    }
    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    // Ensure Candidate/Recruiter profile exists and stays synced with OAuth avatar
    if (user.role === 'candidate') {
      const candProfile = await CandidateProfile.findOne({ user: user._id });
      if (!candProfile) {
        await CandidateProfile.create({ user: user._id, avatarUrl: avatarUrl || undefined });
      } else if (avatarUrl && !candProfile.avatarUrl) {
        candProfile.avatarUrl = avatarUrl;
        await candProfile.save();
      }
    } else if (user.role === 'recruiter') {
      const recProfile = await RecruiterProfile.findOne({ user: user._id });
      if (!recProfile) {
        const defaultCompany = companyName?.trim() || `${name ? name.split(' ')[0] : 'Recruiter'}'s Organization`;
        await RecruiterProfile.create({ user: user._id, companyName: defaultCompany, fullName: user.fullName });
      }
    }
  } else {
    // New user registration via OAuth
    const targetRole: 'candidate' | 'recruiter' = (role === 'recruiter' ? 'recruiter' : 'candidate');
    if ((role as string) === 'admin') {
      throw new ApiError(403, 'Administrator accounts cannot be created via OAuth.');
    }
    const defaultCompany = companyName?.trim() || `${name ? name.split(' ')[0] : 'Recruiter'}'s Organization`;

    const createData: any = {
      fullName: name || email.split('@')[0],
      email,
      role: targetRole,
      authProvider: provider,
      isVerified: true,
      lastLoginAt: new Date(),
    };
    if (avatarUrl) createData.avatarUrl = avatarUrl;
    if (provider === 'google') createData.googleId = sub;
    if (provider === 'linkedin') createData.linkedinId = sub;

    user = await User.create(createData);
    try {
      await createProfileFor(user.id, targetRole, defaultCompany);
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }
  }

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function googleAuth(input: GoogleInput, meta: Meta) {
  // Scenario 1: Authorization Code Flow
  if (input.code) {
    if (input.code.startsWith('mock_') && env.NODE_ENV !== 'production') {
      const codeSuffix = input.code.replace('mock_', '');
      const parsedName = codeSuffix && !codeSuffix.match(/^\d+$/) ? codeSuffix.replace(/_/g, ' ') : 'Google Verified User';
      const email = `google.user.${Date.now()}@example.com`;
      return handleOAuthUser({
        sub: `g_${Date.now()}`,
        email,
        name: parsedName,
        provider: 'google',
        role: input.role,
        companyName: input.companyName,
        meta,
      });
    }

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new ApiError(503, 'Google sign-in is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env');
    }

    const callbackUri = input.redirectUri || env.GOOGLE_REDIRECT_URI || `${env.CLIENT_URL}/oauth/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: input.code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google OAuth] Token exchange error:', errText);
      try {
        const parsed = JSON.parse(errText);
        const detail = parsed.error_description || parsed.error || errText;
        throw ApiError.unauthorized(`Google authorization failed: ${detail}`);
      } catch (e: any) {
        if (e instanceof ApiError) throw e;
        throw ApiError.unauthorized(`Failed to exchange Google authorization code: ${errText}`);
      }
    }

    const tokenData = await tokenRes.json();
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      throw ApiError.unauthorized('Failed to retrieve Google user profile');
    }

    const profile = await profileRes.json();
    if (!profile.sub || !profile.email || profile.email_verified === false) {
      throw ApiError.unauthorized('Google account email is not verified');
    }

    const resolvedName = (profile.name && profile.name.trim()) || [profile.given_name, profile.family_name].filter(Boolean).join(' ').trim() || profile.email.split('@')[0];

    return handleOAuthUser({
      sub: profile.sub,
      email: profile.email.toLowerCase(),
      name: resolvedName,
      avatarUrl: profile.picture,
      provider: 'google',
      role: input.role,
      companyName: input.companyName,
      meta,
    });
  }

  // Scenario 2: Access Token Flow (e.g. from Google popup client)
  if (input.accessToken) {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${input.accessToken}` },
    });
    if (!profileRes.ok) {
      throw ApiError.unauthorized('Failed to retrieve Google user profile from access token');
    }
    const profile = await profileRes.json();
    if (!profile.sub || !profile.email) {
      throw ApiError.unauthorized('Google profile does not contain a verified email');
    }
    const resolvedName = (profile.name && profile.name.trim()) || [profile.given_name, profile.family_name].filter(Boolean).join(' ').trim() || profile.email.split('@')[0];

    return handleOAuthUser({
      sub: profile.sub,
      email: profile.email.toLowerCase(),
      name: resolvedName,
      avatarUrl: profile.picture,
      provider: 'google',
      role: input.role,
      companyName: input.companyName,
      meta,
    });
  }

  // Scenario 3: ID Token / Credential Flow (Google One-Tap / GIS Button)
  if (!input.credential) {
    throw ApiError.badRequest('Either credential (ID token), code, or accessToken must be provided');
  }

  let payload: any;
  if (env.GOOGLE_CLIENT_ID) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw ApiError.unauthorized('Invalid Google credential');
    }
  } else if (env.NODE_ENV !== 'production' && input.credential.includes('.')) {
    try {
      const parts = input.credential.split('.');
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch {
      throw new ApiError(503, 'Google sign-in is not configured. Please set GOOGLE_CLIENT_ID in backend/.env');
    }
  } else {
    throw new ApiError(503, 'Google sign-in is not configured. Please set GOOGLE_CLIENT_ID in backend/.env');
  }

  if (!payload?.sub || !payload.email || payload.email_verified === false) {
    throw ApiError.unauthorized('Google account email is not verified');
  }

  const resolvedName = (payload.name && payload.name.trim()) || [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim() || payload.email.split('@')[0];

  return handleOAuthUser({
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: resolvedName,
    avatarUrl: payload.picture,
    provider: 'google',
    role: input.role,
    companyName: input.companyName,
    meta,
  });
}

export async function linkedinAuth(input: LinkedInInput, meta: Meta) {
  if (input.code.startsWith('mock_') && env.NODE_ENV !== 'production') {
    const email = `linkedin.user.${Date.now()}@example.com`;
    return handleOAuthUser({
      sub: `li_${Date.now()}`,
      email,
      name: 'LinkedIn Professional',
      provider: 'linkedin',
      role: input.role,
      companyName: input.companyName,
      meta,
    });
  }

  if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
    throw new ApiError(503, 'LinkedIn sign-in is not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in backend/.env');
  }

  const callbackUri = input.redirectUri || env.LINKEDIN_REDIRECT_URI || `${env.CLIENT_URL}/oauth/callback`;

  // 1. Exchange authorization code for access token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    client_id: env.LINKEDIN_CLIENT_ID,
    client_secret: env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: callbackUri,
  });

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error('[LinkedIn OAuth] Token exchange error:', errText);
    throw ApiError.unauthorized('Failed to exchange LinkedIn authorization code');
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. Fetch user profile from LinkedIn OIDC userinfo
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    throw ApiError.unauthorized('Failed to retrieve LinkedIn user profile');
  }

  const profile = await profileRes.json();
  if (!profile.sub || !profile.email) {
    throw ApiError.unauthorized('LinkedIn profile does not provide a verified email');
  }

  return handleOAuthUser({
    sub: profile.sub,
    email: profile.email.toLowerCase(),
    name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User',
    avatarUrl: profile.picture,
    provider: 'linkedin',
    role: input.role,
    companyName: input.companyName,
    meta,
  });
}
