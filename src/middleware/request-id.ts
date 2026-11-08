import { randomUUID } from 'node:crypto';
import { RequestHandler } from 'express';

const HEADER = 'X-Request-Id';
const VALID_ID = /^[\w-]{8,64}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get(HEADER);
  req.id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.set(HEADER, req.id);
  next();
};