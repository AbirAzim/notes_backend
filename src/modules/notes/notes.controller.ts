import { RequestHandler } from 'express';
import { notesService } from './notes.service';
import { API_PREFIX } from '../../utils/pagination';

export const notesController = {
  list: (async (req, res) => {
    res.json(await notesService.list(req.user!.id, res.locals.query));
  }) as RequestHandler,

  getOne: (async (req, res) => {
    res.json(await notesService.getOne(req.user!.id, String(req.params.id)));
  }) as RequestHandler,

  create: (async (req, res) => {
    const note = await notesService.create(req.user!.id, req.body);
    res.status(201).location(`${API_PREFIX}/notes/${note._id}`).json(note);
  }) as RequestHandler,

  update: (async (req, res) => {
    res.json(await notesService.update(req.user!.id, String(req.params.id), req.body));
  }) as RequestHandler,

  remove: (async (req, res) => {
    await notesService.remove(req.user!.id, String(req.params.id));
    res.status(204).end();
  }) as RequestHandler,
};