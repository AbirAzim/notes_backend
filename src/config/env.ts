import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1),
  CORS_ORIGIN: z.string().url(),
  FRONTEND_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_VERIFY_SECRET: z.string().min(32),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Secure Notes <no-reply@example.com>'),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const smtpConfigured = parsed.data.SMTP_HOST && parsed.data.SMTP_USER && parsed.data.SMTP_PASS;

if (parsed.data.NODE_ENV === 'production' && !smtpConfigured) {
  console.error('SMTP_HOST, SMTP_USER and SMTP_PASS are required in production');
  process.exit(1);
}

export const env = parsed.data;
