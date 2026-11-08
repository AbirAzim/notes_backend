import { RequestHandler } from 'express';
import { AppError } from '../utils/app-error';
import type { Role } from '../modules/users/user.model';

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    if (!roles.includes(req.user.role)) throw new AppError(403, 'Forbidden');
    next();
  };
