import { Router } from 'express';
import { usersController } from './users.controller';
import { postsController } from '../posts/posts.controller';
import { authenticate } from '../../middleware/authenticate';
import { privateCache } from '../../middleware/cache';
import { validate } from '../../middleware/validate';
import { idParamSchema, paginationSchema } from '../../utils/schemas';
import { groupedByInterestsQuerySchema, updateMeSchema } from './users.schemas';

export const usersRouter = Router();

usersRouter.use(authenticate);

// specific paths first
usersRouter.get('/me', privateCache, usersController.getMe);
usersRouter.patch('/me', validate({ body: updateMeSchema }), usersController.updateMe);

// Scenario 1: users grouped by interest (single aggregate)
usersRouter.get(
  '/grouped-by-interests',
  privateCache,
  validate({ query: groupedByInterestsQuerySchema }),
  usersController.groupedByInterests,
);

// parameterised paths last
usersRouter.get(
  '/:id/posts',
  privateCache,
  validate({ params: idParamSchema, query: paginationSchema }),
  postsController.listByUser,
);
