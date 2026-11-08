import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { Note } from '../notes/note.model';
import { Post } from '../posts/post.model';
import { mailService } from '../mail/mail.service';
import { AppError } from '../../utils/app-error';
import { paginated, toSkip } from '../../utils/pagination';
import { signVerifyToken } from '../../utils/tokens';
import type { PaginationQuery } from '../../utils/schemas';
import { toAdminUserResponse, toAdminNoteResponse } from './admin.serializer';
import type { AdminCreateUserInput, AdminUpdateUserInput } from './admin.schemas';

const USER_FIELDS = 'name email role emailVerified interests createdAt updatedAt';
const NOTE_FIELDS = 'title content owner createdAt updatedAt';
const BCRYPT_COST = 12;

export const adminService = {
  async listUsers(adminId: string, query: PaginationQuery) {
    const [users, total] = await Promise.all([
      User.find()
        .sort({ _id: -1 })
        .skip(toSkip(query))
        .limit(query.limit)
        .select(USER_FIELDS)
        .lean(),
      User.estimatedDocumentCount(),
    ]);
    return paginated(
      users.map((u) => toAdminUserResponse(u, adminId)),
      total,
      query,
      '/admin/users',
    );
  },

  async createUser(adminId: string, input: AdminCreateUserInput, requestId?: string) {
    const password = await bcrypt.hash(input.password, BCRYPT_COST);
    // starts unverified: the person still has to confirm they own the email
    // duplicate email → Mongo 11000 → 409 in the error handler
    const user = await User.create({ ...input, password, emailVerified: false });

    try {
      await mailService.sendVerification(user.email, signVerifyToken(user.id));
    } catch (err) {
      // account exists; the user can use resend-verification
      console.error(
        JSON.stringify({
          requestId,
          event: 'verification_email_failed',
          error: (err as Error).message,
        }),
      );
    }

    // read it back the same way as the other admin methods: lean, safe fields only
    const created = await User.findById(user._id).select(USER_FIELDS).lean();
    if (!created) throw new AppError(404, 'User not found');
    return toAdminUserResponse(created, adminId);
  },

  async updateUser(adminId: string, id: string, input: AdminUpdateUserInput) {
    if (id === adminId && input.role && input.role !== 'ADMIN') {
      throw new AppError(400, 'You cannot remove your own admin role');
    }
    const user = await User.findByIdAndUpdate(id, input, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select(USER_FIELDS)
      .lean();
    if (!user) throw new AppError(404, 'User not found');
    return toAdminUserResponse(user, adminId);
  },

  async deleteUser(adminId: string, id: string) {
    if (id === adminId) throw new AppError(400, 'You cannot delete your own account');

    // user + their notes + their posts: all or nothing
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const { deletedCount } = await User.deleteOne({ _id: id }, { session });
        if (!deletedCount) throw new AppError(404, 'User not found');
        await Note.deleteMany({ owner: id }, { session });
        await Post.deleteMany({ author: id }, { session });
      });
    } finally {
      await session.endSession();
    }
  },

  async listNotes(query: PaginationQuery) {
    const [notes, total] = await Promise.all([
      Note.find()
        .sort({ _id: -1 })
        .skip(toSkip(query))
        .limit(query.limit)
        .select(NOTE_FIELDS)
        .populate<{ owner: { _id: unknown; name: string } | null }>('owner', 'name')
        .lean(),
      Note.estimatedDocumentCount(),
    ]);
    return paginated(notes.map(toAdminNoteResponse), total, query, '/admin/notes');
  },
};
