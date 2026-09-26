import { Response } from 'express';
import { env, isProd } from '../config/env';
import { signToken } from './jwt';
import { User } from '../models/user.model';

/**
 * Issue a JWT + set the auth cookie for a user that is allowed to log in
 * (status ACTIVE). Shared by password login, Google login, and the
 * activate-account flow so "Remember me" behaves identically everywhere.
 *
 * remember=false -> session cookie (cleared when the browser closes) and
 * a short-lived token, as a safety net in case the cookie outlives the
 * browser session in some browser configurations.
 * remember=true  -> cookie + token both persist for ~30 days.
 */
export function issueSession(res: Response, user: User, remember: boolean) {
  const expiresIn = remember ? env.jwtExpiresInRemember : env.jwtExpiresInDefault;
  const token = signToken({ id: user.id, role: user.role }, expiresIn);

  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(remember ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}), // omit maxAge => session cookie
  });

  return token;
}

export function clearSession(res: Response) {
  res.clearCookie(env.cookieName, { httpOnly: true, secure: isProd, sameSite: 'lax' });
}
