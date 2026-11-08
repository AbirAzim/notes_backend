import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/app-error';

export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new AppError(429, 'Too many requests, try again later')),
});
