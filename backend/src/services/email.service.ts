import nodemailer from 'nodemailer';
import { env, isProd } from '../config/env';

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? '' } : undefined,
    })
  : null;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sendEmail(to: string, subject: string, text: string, html: string) {
  if (!transporter) {
    if (isProd) throw new Error('SMTP is not configured');
    console.log(`\n[email - dev mode, not sent]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, text, html });
}

export function sendVerificationEmail(to: string, name: string, link: string) {
  return sendEmail(
    to,
    'Verify your HireSmart AI email',
    `Hi ${name},\n\nConfirm your email address: ${link}\n\nThis link expires in 24 hours.`,
    `<p>Hi ${escapeHtml(name)},</p>
     <p><a href="${link}">Confirm your email address</a></p>
     <p>This link expires in 24 hours. If you didn't create an account, ignore this email.</p>`,
  );
}

export function sendPasswordResetEmail(to: string, name: string, link: string) {
  return sendEmail(
    to,
    'Reset your HireSmart AI password',
    `Hi ${name},\n\nReset your password: ${link}\n\nThis link expires in 1 hour. If you didn't ask for this, ignore this email.`,
    `<p>Hi ${escapeHtml(name)},</p>
     <p><a href="${link}">Reset your password</a></p>
     <p>This link expires in 1 hour. If you didn't ask for this, ignore this email.</p>`,
  );
}
