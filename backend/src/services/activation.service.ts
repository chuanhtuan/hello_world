import crypto from 'crypto';
import { User, UserStatus, AuthProvider, Role } from '../models/user.model';
import { env } from '../config/env';
import { sendActivationEmail } from '../utils/mailer';

export function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Creates a PENDING local-account user and emails them an activation
 * link. Shared by self sign-up (auth.controller) and admin-created
 * users (user.controller) - both flows collect only name + email and
 * let the user set their own password once they click the link.
 */
export async function createPendingUserAndSendActivation(name: string, email: string, role: Role = Role.USER) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    name,
    email,
    role,
    status: UserStatus.PENDING,
    provider: AuthProvider.LOCAL,
    activationToken: hashToken(rawToken),
    activationTokenExpires: new Date(Date.now() + env.activationTokenTtlMs),
  });

  const activationUrl = `${env.clientUrl}/activate/${rawToken}`;
  await sendActivationEmail(user.email, user.name, activationUrl);
  return user;
}
