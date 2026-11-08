import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './app-error';
import type { Role } from '../modules/users/user.model';

const ALG = 'HS256' as const;

// ---------- access token (login) ----------
export const signAccessToken = (userId: string, role: Role) =>
  jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    algorithm: ALG,
    subject: userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

// ---------- email verification ----------
export const signVerifyToken = (userId: string) =>
  jwt.sign({ purpose: 'verify' }, env.JWT_VERIFY_SECRET, {
    algorithm: ALG,
    subject: userId,
    expiresIn: '24h',
  });

export function verifyVerifyToken(token: string): { userId: string } {
  try {
    const p = jwt.verify(token, env.JWT_VERIFY_SECRET, { algorithms: [ALG] }) as jwt.JwtPayload;
    if (p.purpose !== 'verify' || !p.sub) throw new Error();
    return { userId: p.sub };
  } catch {
    throw new AppError(400, 'Invalid or expired verification link');
  }
}

// ---------- invitation ----------
export const signInviteToken = (email: string, role: Role) =>
  jwt.sign({ email, role, purpose: 'invite' }, env.JWT_INVITE_SECRET, {
    algorithm: ALG,
    expiresIn: '48h',
  });

export function verifyInviteToken(token: string): { email: string; role: Role } {
  try {
    const p = jwt.verify(token, env.JWT_INVITE_SECRET, { algorithms: [ALG] }) as jwt.JwtPayload;
    if (p.purpose !== 'invite' || !p.email || !p.role) throw new Error();
    return { email: p.email, role: p.role };
  } catch {
    throw new AppError(400, 'Invalid or expired invitation link');
  }
}
