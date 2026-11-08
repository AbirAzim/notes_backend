import { RequestHandler } from 'express';
import { usersService } from './users.service';

export const usersController = {
  getMe: (async (req, res) => {
    res.json(await usersService.getMe(req.user!.id));
  }) as RequestHandler,

  updateMe: (async (req, res) => {
    res.json(await usersService.updateMe(req.user!.id, req.body));
  }) as RequestHandler,

  // Scenario 1: users grouped by interest
  groupedByInterests: (async (_req, res) => {
    res.json(await usersService.groupedByInterests(res.locals.query));
  }) as RequestHandler,
};