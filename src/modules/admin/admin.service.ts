import mongoose from 'mongoose';
import { User } from '../users/user.model';
import { Note } from '../notes/note.model';
import { Post } from '../posts/post.model';
import { AppError } from '../../utils/app-error';
import { paginated, toSkip } from '../../utils/pagination';
import type { PaginationQuery } from '../../utils/schemas';
import { toAdminUserResponse, toAdminNoteResponse } from './admin.serializer';
import type { AdminUpdateUserInput } from './admin.schemas';

const USER_FIELDS = 'name email role emailVerified interests createdAt updatedAt';
const NOTE_FIELDS = 'title content owner createdAt updatedAt';

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
