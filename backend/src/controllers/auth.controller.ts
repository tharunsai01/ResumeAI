import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { CookieOptions, Request, Response } from 'express';
import type { Types } from 'mongoose';
import { env, isProd } from '../config/env';
import { CandidateProfile, RecruiterProfile, RefreshToken, User } from '../models';
import { audit } from '../services/audit';
import { ApiError } from '../utils/ApiError';
import { created, ok } from '../utils/response';
import { generateRefreshToken, hashToken, signAccessToken, signState, verifyState } from '../utils/tokens';
import type { Role } from '../constants';

export const REFRESH_COOKIE = 'hs_refresh';
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 12);

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
});

async function issueSession(req: Request, res: Response, user: { _id: Types.ObjectId; role: string }, family?: string) {
  const { token, hash } = generateRefreshToken();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hash,
    family: family ?? crypto.randomUUID(),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400000),
    userAgent: req.get('user-agent')?.slice(0, 300),
    ip: req.ip,
  });
  res.cookie(REFRESH_COOKIE, token, cookieOptions());
  return { accessToken: signAccessToken({ sub: String(user._id), role: user.role as Role }), hash };
}

async function createProfile(userId: Types.ObjectId, role: string, company?: string) {
  // New accounts start empty: no generated or placeholder personal details.
  if (role === 'candidate') await CandidateProfile.create({ user: userId });
  if (role === 'recruiter') await RecruiterProfile.create({ user: userId, company: company ?? '' });
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role, company } = req.valid.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role, authProvider: 'local', lastLoginAt: new Date() });
  try {
    await createProfile(user._id, role, company);
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // keep user and profile consistent without transactions
    throw err;
  }
  const { accessToken } = await issueSession(req, res, user);
  await audit(req, { action: 'auth.register', category: 'auth', actor: { id: String(user._id), role, email }, targetType: 'User', targetId: String(user._id) });
  return created(res, { user: user.toJSON(), accessToken });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.valid.body;
  const user = await User.findOne({ email }).select('+passwordHash +failedLoginAttempts +lockUntil');
  const fail = async (reason: string) => {
    await audit(req, { action: 'auth.login_failed', category: 'auth', severity: 'warning', metadata: { email, reason }, actor: user ? { id: String(user._id), role: user.role, email } : undefined });
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  };
  if (!user || !user.passwordHash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return fail(user ? 'oauth_account' : 'unknown_email');
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(429, `Too many failed attempts. Try again after ${user.lockUntil.toISOString()}`, 'ACCOUNT_LOCKED');
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
      user.failedLoginAttempts = 0;
      await audit(req, { action: 'auth.account_locked', category: 'auth', severity: 'critical', actor: { id: String(user._id), role: user.role, email } });
    }
    await user.save();
    return fail('bad_password');
  }
  if (user.status !== 'active') throw new ApiError(403, 'This account has been suspended. Contact support.', 'ACCOUNT_SUSPENDED');
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();
  const { accessToken } = await issueSession(req, res, user);
  await audit(req, { action: 'auth.login', category: 'auth', actor: { id: String(user._id), role: user.role, email } });
  return ok(res, { user: user.toJSON(), accessToken });
}

/** Refresh-token rotation with reuse detection. */
export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token || typeof token !== 'string') throw ApiError.unauthorized('No session');
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
  if (!stored || stored.expiresAt < new Date()) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    throw ApiError.unauthorized('Session expired');
  }
  if (stored.revokedAt) {
    // A rotated token was presented again: assume theft and kill the whole family.
    await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
    await audit(req, { action: 'auth.refresh_reuse_detected', category: 'auth', severity: 'critical', actor: { id: String(stored.user) }, metadata: { family: stored.family } });
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    throw ApiError.unauthorized('Session invalidated. Please sign in again.');
  }
  const user = await User.findById(stored.user);
  if (!user || user.status !== 'active') throw ApiError.unauthorized('Account unavailable');
  const { accessToken, hash } = await issueSession(req, res, user, stored.family);
  stored.revokedAt = new Date();
  stored.replacedBy = hash;
  await stored.save();
  return ok(res, { user: user.toJSON(), accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (typeof token === 'string') {
    const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
    if (stored) await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  return ok(res, { loggedOut: true });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User');
  return ok(res, { user: user.toJSON() });
}

// --- OAuth (Google, LinkedIn via OpenID Connect) -----------------------------------
const PROVIDERS = {
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    id: () => env.GOOGLE_CLIENT_ID,
    secret: () => env.GOOGLE_CLIENT_SECRET,
  },
  linkedin: {
    authorize: 'https://www.linkedin.com/oauth/v2/authorization',
    token: 'https://www.linkedin.com/oauth/v2/accessToken',
    userinfo: 'https://api.linkedin.com/v2/userinfo',
    scope: 'openid profile email',
    id: () => env.LINKEDIN_CLIENT_ID,
    secret: () => env.LINKEDIN_CLIENT_SECRET,
  },
} as const;
type Provider = keyof typeof PROVIDERS;

function providerFrom(req: Request): Provider {
  const p = String(req.params.provider);
  if (p !== 'google' && p !== 'linkedin') throw ApiError.notFound('OAuth provider');
  if (!PROVIDERS[p].id() || !PROVIDERS[p].secret()) throw new ApiError(501, `${p} sign-in is not configured on this server`, 'OAUTH_NOT_CONFIGURED');
  return p;
}

const callbackUrl = (p: Provider) => `${env.PUBLIC_API_URL}/api/v1/auth/oauth/${p}/callback`;

export function providers(_req: Request, res: Response) {
  return ok(res, {
    google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    linkedin: !!(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET),
  });
}

export function oauthStart(req: Request, res: Response) {
  const provider = providerFrom(req);
  const role = req.query.role === 'recruiter' ? 'recruiter' : 'candidate';
  const nonce = crypto.randomBytes(16).toString('hex');
  res.cookie('hs_oauth_nonce', nonce, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/api/v1/auth', maxAge: 10 * 60000 });
  const cfg = PROVIDERS[provider];
  const params = new URLSearchParams({
    client_id: cfg.id(),
    redirect_uri: callbackUrl(provider),
    response_type: 'code',
    scope: cfg.scope,
    state: signState({ role, nonce, provider }),
  });
  res.redirect(`${cfg.authorize}?${params}`);
}

export async function oauthCallback(req: Request, res: Response) {
  const fail = (reason: string) => res.redirect(`${env.FRONTEND_URL}/login?oauth_error=${encodeURIComponent(reason)}`);
  let provider: Provider;
  try {
    provider = providerFrom(req);
  } catch {
    return fail('provider_unavailable');
  }
  const { code, state } = req.query;
  if (typeof code !== 'string' || typeof state !== 'string') return fail('missing_code');
  let st: Record<string, string>;
  try {
    st = verifyState(state);
  } catch {
    return fail('invalid_state');
  }
  if (st.provider !== provider || st.nonce !== req.cookies?.hs_oauth_nonce) return fail('state_mismatch');
  res.clearCookie('hs_oauth_nonce', { path: '/api/v1/auth' });

  const cfg = PROVIDERS[provider];
  try {
    const tokenRes = await fetch(cfg.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: cfg.id(), client_secret: cfg.secret(), redirect_uri: callbackUrl(provider), grant_type: 'authorization_code' }),
    });
    if (!tokenRes.ok) return fail('token_exchange_failed');
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    const infoRes = await fetch(cfg.userinfo, { headers: { Authorization: `Bearer ${access_token}` } });
    if (!infoRes.ok) return fail('profile_failed');
    const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean | string; name?: string };
    if (!info.sub || !info.email) return fail('email_required');
    const verified = info.email_verified === true || info.email_verified === 'true';
    const email = info.email.toLowerCase();

    let user = await User.findOne({ $or: [{ providerId: `${provider}:${info.sub}` }, { email }] });
    if (user && user.providerId !== `${provider}:${info.sub}`) {
      if (!verified) return fail('email_not_verified');
      user.providerId ??= `${provider}:${info.sub}`;
    }
    if (!user) {
      const role = st.role === 'recruiter' ? 'recruiter' : 'candidate';
      user = await User.create({ name: (info.name || email.split('@')[0]).slice(0, 80), email, role, authProvider: provider, providerId: `${provider}:${info.sub}` });
      await createProfile(user._id, role);
      await audit(req, { action: 'auth.register_oauth', category: 'auth', actor: { id: String(user._id), role, email }, metadata: { provider } });
    }
    if (user.status !== 'active') return fail('account_suspended');
    user.lastLoginAt = new Date();
    await user.save();
    await issueSession(req, res, user);
    await audit(req, { action: 'auth.login_oauth', category: 'auth', actor: { id: String(user._id), role: user.role, email }, metadata: { provider } });
    return res.redirect(`${env.FRONTEND_URL}/auth/callback`);
  } catch {
    return fail('provider_error');
  }
}
