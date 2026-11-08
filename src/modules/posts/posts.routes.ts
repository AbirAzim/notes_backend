import { Router } from 'express';
import { postsController } from './posts.controller';
import { authenticate } from '../../middleware/authenticate';
import { privateCache } from '../../middleware/cache';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../../utils/schemas';
import { createPostSchema, updatePostSchema } from './posts.schemas';

export const postsRouter = Router();

postsRouter.use(authenticate);

postsRouter.post('/', validate({ body: createPostSchema }), postsController.create);
postsRouter.get('/:id', privateCache, validate({ params: idParamSchema }), postsController.getOne);
postsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updatePostSchema }),
  postsController.update,
);
postsRouter.delete('/:id', validate({ params: idParamSchema }), postsController.remove);
