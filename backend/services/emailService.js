import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtp.user || !env.smtp.pass) {
    throw new Error(
      'Email is not configured. Set SMTP_USER and SMTP_PASS in backend/.env',
    );
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const mailer = getTransporter();
  const from = env.smtp.from || env.smtp.user;

  await mailer.sendMail({
    from: `"MOTD" <${from}>`,
    to,
    subject: 'Reset your MOTD password',
    text: [
      'You requested a password reset for your MOTD account.',
      '',
      `Reset your password using this link (valid for 1 hour):`,
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #111;">
        <p style="letter-spacing: 0.2em; font-size: 11px; text-transform: uppercase; color: #666;">MOTD Account</p>
        <h1 style="font-size: 24px; font-weight: 400; text-transform: uppercase;">Reset your password</h1>
        <p style="color: #555; line-height: 1.6;">
          You requested a password reset. Click the button below to choose a new password.
          This link expires in 1 hour.
        </p>
        <p style="margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 14px 28px; letter-spacing: 0.2em; font-size: 12px; text-transform: uppercase;">
            Reset Password
          </a>
        </p>
        <p style="color: #888; font-size: 13px; line-height: 1.6;">
          If the button does not work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #555; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #aaa; font-size: 12px; margin-top: 32px;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export function isEmailConfigured() {
  return Boolean(env.smtp.user && env.smtp.pass);
}
