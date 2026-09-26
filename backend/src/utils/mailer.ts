import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: env.smtp.user
    ? {
        user: env.smtp.user,
        pass: env.smtp.pass,
      }
    : undefined,
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Reset your HelloWorld password',
    text: `You requested a password reset. Click the link below to set a new password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a> (valid for 1 hour).</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}

export async function sendActivationEmail(to: string, name: string, activationUrl: string) {
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Activate your HelloWorld account',
    text: `Hi ${name},\n\nAn account was created for you on HelloWorld. Click the link below to set your password and activate your account (valid for 24 hours):\n\n${activationUrl}\n\nIf you did not expect this, you can ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>An account was created for you on HelloWorld.</p>
      <p><a href="${activationUrl}">Click here to set your password and activate your account</a> (valid for 24 hours).</p>
      <p>If you did not expect this, you can ignore this email.</p>
    `,
  });
}
