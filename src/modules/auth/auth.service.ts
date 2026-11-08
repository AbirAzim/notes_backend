import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { mailService } from '../mail/mail.service';
import { AppError } from '../../utils/app-error';
import { link } from '../../utils/pagination';
import { toUserResponse } from '../users/user.serializer';
import {
  signAccessToken,
  signVerifyToken,
  verifyVerifyToken,
  verifyInviteToken,
} from '../../utils/tokens';
import type { RegisterInput, LoginInput, AcceptInviteInput } from './auth.schemas';

const BCRYPT_COST = 12;
// used when the email doesn't exist, so login takes the same time either way
const DUMMY_HASH = bcrypt.hashSync('timing-attack-protection', BCRYPT_COST);

const authLinks = () => ({ me: link('/users/me'), notes: link('/notes') });

export const authService = {
  async register(input: RegisterInput) {
    const password = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await User.create({ ...input, password, role: 'USER', emailVerified: false });

    try {
      await mailService.sendVerification(user.email, signVerifyToken(user.id));
    } catch (err) {
      // account exists; the user can request a new email via resend-verification
      console.error(JSON.stringify({ event: 'verification_email_failed', error: (err as Error).message }));
    }

    return { message: 'Registration successful. Please check your email to verify your account.' };
  },

  async verifyEmail(token: string) {
    const { userId } = verifyVerifyToken(token);
    const result = await User.updateOne({ _id: userId }, { emailVerified: true });
    if (result.matchedCount === 0) throw new AppError(400, 'Invalid or expired verification link');
    return { message: 'Email verified. You can now log in.' };
  },

  async resendVerification(email: string) {
    const user = await User.findOne({ email }).select('emailVerified').lean();
    if (user && !user.emailVerified) {
      await mailService.sendVerification(email, signVerifyToken(String(user._id)));
    }
    // same answer whether or not the email exists
    return { message: 'If the account exists and is not verified, a new email has been sent.' };
  },

  async login({ email, password }: LoginInput) {
    const user = await User.findOne({ email }).select('+password').lean();

    const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !ok) throw new AppError(401, 'Invalid email or password');
    if (!user.emailVerified) throw new AppError(403, 'Please verify your email before logging in');

    return {
      accessToken: signAccessToken(String(user._id), user.role),
      user: toUserResponse(user),
      _links: authLinks(),
    };
  },

  async acceptInvite({ token, name, password }: AcceptInviteInput) {
    const { email, role } = verifyInviteToken(token);
    const hash = await bcrypt.hash(password, BCRYPT_COST);

    // unique email index makes the link single-use: a second use → E11000 → 409
    const user = await User.create({ name, email, password: hash, role, emailVerified: true });

    return {
      accessToken: signAccessToken(user.id, user.role),
      user: toUserResponse(user),
      _links: authLinks(),
    };
  },
};