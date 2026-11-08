import { Router } from 'express';
import { notesController } from './notes.controller';
import { authenticate } from '../../middleware/authenticate';
import { privateCache } from '../../middleware/cache';
import { validate } from '../../middleware/validate';
import { idParamSchema, paginationSchema } from '../../utils/schemas';
import { createNoteSchema, updateNoteSchema } from './notes.schemas';

export const notesRouter = Router();

notesRouter.use(authenticate);

notesRouter.get('/', privateCache, validate({ query: paginationSchema }), notesController.list);
notesRouter.post('/', validate({ body: createNoteSchema }), notesController.create);

notesRouter.get('/:id', privateCache, validate({ params: idParamSchema }), notesController.getOne);
notesRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateNoteSchema }),
  notesController.update,
);
notesRouter.delete('/:id', validate({ params: idParamSchema }), notesController.remove);
