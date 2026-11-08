import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';

const tooMany = () => new AppError(429, 'Too many requests, try again later');

// tests send many requests from one "IP" — limits would make unrelated tests fail with 429
const isTest = () => env.NODE_ENV === 'test';

// global: every /api/v1 request, per client IP
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: isTest,
  handler: (_req, _res, next) => next(tooMany()),
});

// strict: register, login, verify-email, resend-verification, per client IP
export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: isTest,
  handler: (_req, _res, next) => next(tooMany()),
});
