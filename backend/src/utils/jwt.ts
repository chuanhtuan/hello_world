import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../models/user.model';

export interface TokenPayload {
  id: number;
  role: Role;
}

export function signToken(payload: TokenPayload, expiresIn?: string): string {
  const options: SignOptions = {
    expiresIn: (expiresIn ?? env.jwtExpiresInDefault) as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
