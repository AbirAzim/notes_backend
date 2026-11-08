import { RequestHandler } from 'express';
import { authService } from './auth.service';

export const authController = {
  register: (async (req, res) => {
    res.status(201).json(await authService.register(req.body, req.id));
  }) as RequestHandler,

  verifyEmail: (async (req, res) => {
    res.json(await authService.verifyEmail(req.body.token));
  }) as RequestHandler,

  resendVerification: (async (req, res) => {
    res.json(await authService.resendVerification(req.body.email));
  }) as RequestHandler,

  login: (async (req, res) => {
    res.json(await authService.login(req.body));
  }) as RequestHandler,
};
