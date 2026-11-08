import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';
import { ROLES, type Role } from '../modules/users/user.model';

type AccessPayload = { sub: string; role: Role };

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing access token');
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as AccessPayload;

    if (!payload.sub || !ROLES.includes(payload.role)) {
      throw new Error('Invalid payload');
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
