import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Op } from 'sequelize';
import { z } from 'zod';
import { User, UserStatus, AuthProvider } from '../models/user.model';
import { env } from '../config/env';
import { sendPasswordResetEmail, sendActivationEmail } from '../utils/mailer';
import { issueSession, clearSession } from '../utils/session';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middlewares/error.middleware';
import { createPendingUserAndSendActivation, hashToken } from '../services/activation.service';

const googleClient = new OAuth2Client(env.google.clientId);

// ---------------------------------------------------------------------
// POST /api/auth/signup - self-registration. Only name + email are
// collected up front; the account starts PENDING and the user sets
// their password after clicking the emailed activation link.
// ---------------------------------------------------------------------
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = signupSchema.parse(req.body);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.status === UserStatus.ACTIVE) {
      throw new ApiError(409, 'An account with this email already exists. Try logging in instead.');
    }
    // Already registered but never activated - resend a fresh link
    // instead of erroring, so a lost email doesn't dead-end the user.
    const rawToken = crypto.randomBytes(32).toString('hex');
    existing.name = name || existing.name;
    existing.activationToken = hashToken(rawToken);
    existing.activationTokenExpires = new Date(Date.now() + env.activationTokenTtlMs);
    await existing.save();
    await sendActivationEmail(existing.email, existing.name, `${env.clientUrl}/activate/${rawToken}`);
    return res.status(200).json({
      message: 'This email is already registered but not yet activated. We sent a new activation link.',
    });
  }

  await createPendingUserAndSendActivation(name, email);
  res.status(201).json({
    message: 'Account created. Check your email for a link to set your password and activate your account.',
  });
});

// ---------------------------------------------------------------------
// GET /api/auth/activate/:token - lets the frontend validate the token
// (and greet the user by name) before showing the "set password" form.
// ---------------------------------------------------------------------
export const getActivation = asyncHandler(async (req: Request, res: Response) => {
  const hashed = hashToken(req.params.token);
  const user = await User.findOne({
    where: { activationToken: hashed, activationTokenExpires: { [Op.gt]: new Date() } },
  });

  if (!user) {
    throw new ApiError(400, 'This activation link is invalid or has expired.');
  }

  res.json({ name: user.name, email: user.email });
});

// ---------------------------------------------------------------------
// POST /api/auth/activate/:token - sets the password, marks the account
// ACTIVE, and logs the user in.
// ---------------------------------------------------------------------
const activateSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const activateAccount = asyncHandler(async (req: Request, res: Response) => {
  const hashed = hashToken(req.params.token);
  const { password } = activateSchema.parse(req.body);

  const user = await User.findOne({
    where: { activationToken: hashed, activationTokenExpires: { [Op.gt]: new Date() } },
  });

  if (!user) {
    throw new ApiError(400, 'This activation link is invalid or has expired.');
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.status = UserStatus.ACTIVE;
  user.activationToken = null;
  user.activationTokenExpires = null;
  await user.save();

  const token = issueSession(res, user, false);
  res.json({ token, user: user.toPublicJSON() });
});

// ---------------------------------------------------------------------
// POST /api/auth/resend-activation - re-sends the activation email for
// a PENDING account (e.g. the first one expired or was lost).
// ---------------------------------------------------------------------
const resendActivationSchema = z.object({ email: z.string().email() });

export const resendActivation = asyncHandler(async (req: Request, res: Response) => {
  const { email } = resendActivationSchema.parse(req.body);
  const user = await User.findOne({ where: { email } });

  // Always respond the same way, whether or not the account exists /
  // is already active, to avoid leaking account state to a stranger.
  if (user && user.status === UserStatus.PENDING) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.activationToken = hashToken(rawToken);
    user.activationTokenExpires = new Date(Date.now() + env.activationTokenTtlMs);
    await user.save();
    await sendActivationEmail(user.email, user.name, `${env.clientUrl}/activate/${rawToken}`);
  }

  res.json({ message: 'If that email needs activation, a new link has been sent.' });
});

// ---------------------------------------------------------------------
// POST /api/auth/login - email + password, with a "remember me" flag
// controlling session length (see utils/session.ts).
// ---------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, remember } = loginSchema.parse(req.body);

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.passwordHash) {
    // Account exists but was created via Google and never set a
    // password (or is still PENDING activation).
    if (user.provider === AuthProvider.GOOGLE) {
      throw new ApiError(400, 'This account uses Google Sign-In. Please continue with Google.');
    }
    throw new ApiError(403, 'Please activate your account first - check your email for the activation link.');
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(403, 'Please activate your account first - check your email for the activation link.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = issueSession(res, user, remember);
  res.json({ token, user: user.toPublicJSON() });
});

// ---------------------------------------------------------------------
// POST /api/auth/google - sign-up or login via a Google ID token
// (obtained client-side from Google Identity Services). Google has
// already verified the email, so the account is activated immediately.
// ---------------------------------------------------------------------
const googleAuthSchema = z.object({
  credential: z.string().min(1),
  remember: z.boolean().optional().default(false),
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  if (!env.google.clientId) {
    throw new ApiError(500, 'Google Sign-In is not configured on the server (missing GOOGLE_CLIENT_ID).');
  }

  const { credential, remember } = googleAuthSchema.parse(req.body);

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.google.clientId });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(400, 'Google account email is not verified');
  }

  let user = await User.findOne({ where: { googleId: payload.sub } });

  if (!user) {
    user = await User.findOne({ where: { email: payload.email } });
  }

  if (user) {
    // Link the Google identity to an existing account (e.g. one that
    // registered by email first) and make sure it's usable.
    user.googleId = user.googleId ?? payload.sub;
    user.status = UserStatus.ACTIVE;
    user.avatarUrl = user.avatarUrl ?? payload.picture ?? null;
    await user.save();
  } else {
    user = await User.create({
      name: payload.name ?? payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      provider: AuthProvider.GOOGLE,
      status: UserStatus.ACTIVE,
      avatarUrl: payload.picture ?? null,
    });
  }

  const token = issueSession(res, user, remember);
  res.json({ token, user: user.toPublicJSON() });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearSession(res);
  res.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------
// Forgot / reset password (unchanged - for ACTIVE local accounts)
// ---------------------------------------------------------------------
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await User.findOne({ where: { email } });
  // Always respond with 200 to avoid leaking which emails are registered.
  if (!user || user.status !== UserStatus.ACTIVE) {
    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpires = expires;
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  res.json({ message: 'If that email is registered, a reset link has been sent.' });
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = resetPasswordSchema.parse(req.body);

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset link is invalid or has expired');
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: 'Password has been reset. You can now log in.' });
});
