import nodemailer from 'nodemailer';
import { env } from '../../config/env';

const transporter =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // 465 = TLS from the first byte
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    // no SMTP configured (local dev): log instead of sending
    console.log(JSON.stringify({ mail: { to, subject, html } }));
    return;
  }

  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

export const mailService = {
  sendVerification: (to: string, token: string) => {
    const url = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
    return sendEmail(
      to,
      'Verify your email',
      `<p>Welcome to Secure Notes!</p><p><a href="${url}">Verify your email</a> (valid for 24 hours).</p>`,
    );
  },
};
