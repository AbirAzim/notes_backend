import { RequestHandler } from 'express';

// default for every response: never cached
export const noStore: RequestHandler = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

// authenticated reads: browser may store, must revalidate with the ETag every time
export const privateCache: RequestHandler = (_req, res, next) => {
  res.set('Cache-Control', 'private, no-cache');
  res.vary('Authorization');
  next();
};
