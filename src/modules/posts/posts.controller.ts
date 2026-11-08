import { RequestHandler } from 'express';
import { postsService } from './posts.service';
import { API_PREFIX } from '../../utils/pagination';

export const postsController = {
  create: (async (req, res) => {
    const post = await postsService.create(req.user!.id, req.body);
    res.status(201).location(`${API_PREFIX}/posts/${post._id}`).json(post);
  }) as RequestHandler,

  getOne: (async (req, res) => {
    res.json(await postsService.getOne(req.user!.id, String(req.params.id)));
  }) as RequestHandler,

  update: (async (req, res) => {
    res.json(await postsService.update(req.user!.id, String(req.params.id), req.body));
  }) as RequestHandler,

  remove: (async (req, res) => {
    await postsService.remove(req.user!.id, String(req.params.id));
    res.status(204).end();
  }) as RequestHandler,

  listByUser: (async (req, res) => {
    res.json(await postsService.listByUser(req.user!.id, String(req.params.id), res.locals.query));
  }) as RequestHandler,
};
