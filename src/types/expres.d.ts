import type { Role } from '../modules/users/user.model';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: { id: string; role: Role };
    }
  }
}

export {};