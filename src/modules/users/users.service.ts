import { User } from './user.model';
import { AppError } from '../../utils/app-error';
import { toUserResponse } from './user.serializer';
import type { UpdateMeInput } from './users.schemas';

export const usersService = {
  async getMe(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw new AppError(404, 'User not found');
    return toUserResponse(user);
  },

  async updateMe(userId: string, input: UpdateMeInput) {
    const user = await User.findByIdAndUpdate(userId, input, {
      new: true,
      runValidators: true,
    }).lean();
    if (!user) throw new AppError(404, 'User not found');
    return toUserResponse(user);
  },
};
