import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // one place builds every error response, always with the trace id
  const send = (statusCode: number, message: string) =>
    res.status(statusCode).json({ statusCode, message, requestId: req.id });

  if (err instanceof AppError) return send(err.statusCode, err.message);

  if (err instanceof ZodError) return send(400, err.issues[0]?.message ?? 'Invalid input');

  if (err?.code === 11000) return send(409, 'Email already in use');

  if (err?.type === 'entity.too.large') return send(413, 'Request body too large');
  if (err?.type === 'entity.parse.failed') return send(400, 'Malformed JSON body');

  console.error(JSON.stringify({ requestId: req.id, error: err?.message, stack: err?.stack }));
  return send(500, 'Internal server error');
};
