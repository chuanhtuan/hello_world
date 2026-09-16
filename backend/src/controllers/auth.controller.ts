import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { z } from 'zod';
import { User } from '../models/user.model';
import { env, isProd } from '../config/env';
import { signToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/mailer';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middlewares/error.middleware';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = signupSchema.parse(req.body);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken({ id: user.id, role: user.role });
  res.cookie(env.cookieName, token, cookieOptions);
  res.status(201).json({ token, user: user.toPublicJSON() });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });
  res.cookie(env.cookieName, token, cookieOptions);
  res.json({ token, user: user.toPublicJSON() });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, { httpOnly: true, secure: isProd, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await User.findOne({ where: { email } });
  // Always respond with 200 to avoid leaking which emails are registered.
  if (!user) {
    return res.json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = hashedToken;
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

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
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
