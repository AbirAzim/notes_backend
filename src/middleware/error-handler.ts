import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ statusCode: 400, message: err.issues[0]?.message ?? 'Invalid input' });
    return;
  }

  if (err?.code === 11000) {
    res.status(409).json({ statusCode: 409, message: 'Email already in use' });
    return;
  }

  console.error(err);
  res.status(500).json({ statusCode: 500, message: 'Internal server error' });
};