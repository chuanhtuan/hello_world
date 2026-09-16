import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { Role } from '../models/user.model';
import { ApiError } from './error.middleware';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = req.cookies?.[env.cookieName] ?? bearer;

  if (!token) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired session'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    next();
  };
}
