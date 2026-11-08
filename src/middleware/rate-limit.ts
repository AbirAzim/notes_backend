import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/app-error';

const tooMany = () => new AppError(429, 'Too many requests, try again later');

// global: every /api/v1 request, per client IP
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(tooMany()),
});

// strict: login, register, resend-verification, accept-invite, per client IP
export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(tooMany()),
});
