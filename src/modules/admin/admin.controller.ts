import { RequestHandler } from 'express';
import { adminService } from './admin.service';

export const adminController = {
  listUsers: (async (req, res) => {
    res.json(await adminService.listUsers(req.user!.id, res.locals.query));
  }) as RequestHandler,

  createUser: (async (req, res) => {
    const user = await adminService.createUser(req.user!.id, req.body, req.id);
    res.status(201).location(`/api/v1/admin/users/${user._id}`).json(user);
  }) as RequestHandler,

  updateUser: (async (req, res) => {
    res.json(await adminService.updateUser(req.user!.id, String(req.params.id), req.body));
  }) as RequestHandler,

  deleteUser: (async (req, res) => {
    await adminService.deleteUser(req.user!.id, String(req.params.id));
    res.status(204).end();
  }) as RequestHandler,

  listNotes: (async (_req, res) => {
    res.json(await adminService.listNotes(res.locals.query));
  }) as RequestHandler,
};