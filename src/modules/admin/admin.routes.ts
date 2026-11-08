import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { privateCache } from '../../middleware/cache';
import { validate } from '../../middleware/validate';
import { idParamSchema, paginationSchema } from '../../utils/schemas';
import { adminUpdateUserSchema } from './admin.schemas';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get(
  '/users',
  privateCache,
  validate({ query: paginationSchema }),
  adminController.listUsers,
);
adminRouter.patch(
  '/users/:id',
  validate({ params: idParamSchema, body: adminUpdateUserSchema }),
  adminController.updateUser,
);
adminRouter.delete('/users/:id', validate({ params: idParamSchema }), adminController.deleteUser);

adminRouter.get(
  '/notes',
  privateCache,
  validate({ query: paginationSchema }),
  adminController.listNotes,
);
