import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rate-limit';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  acceptInviteSchema,
} from './auth.schemas';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/verify-email', validate({ body: verifyEmailSchema }), authController.verifyEmail);
authRouter.post(
  '/resend-verification',
  validate({ body: resendVerificationSchema }),
  authController.resendVerification,
);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);
authRouter.post(
  '/accept-invite',
  validate({ body: acceptInviteSchema }),
  authController.acceptInvite,
);
