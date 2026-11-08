import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { privateCache } from '../../middleware/cache';
import { validate } from '../../middleware/validate';
import { updateMeSchema } from './users.schemas';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/me', privateCache, usersController.getMe);
usersRouter.patch('/me', validate({ body: updateMeSchema }), usersController.updateMe);

// added later (before any /:id route): /grouped-by-interests, /:id/posts