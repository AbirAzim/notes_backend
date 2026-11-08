import { User } from './user.model';
import { AppError } from '../../utils/app-error';
import { paginated, toSkip } from '../../utils/pagination';
import { toUserResponse } from './user.serializer';
import type { UpdateMeInput, GroupedByInterestsQuery } from './users.schemas';

type InterestGroup = {
  interest: string;
  count: number;
  users: { _id: unknown; name: string }[];
};

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

  // Scenario 1: users grouped by interest — exactly one aggregate() call
  async groupedByInterests(query: GroupedByInterestsQuery) {
    const filter = query.interests?.length ? { interests: { $in: query.interests } } : null;

    const [result] = await User.aggregate<{ meta: { total: number }[]; data: InterestGroup[] }>([
      // 1. narrow users first — uses the multikey { interests: 1 } index
      ...(filter ? [{ $match: filter }] : []),

      // 2. only what we need — never the password hash
      { $project: { name: 1, interests: 1 } },

      // 3. one document per (user, interest)
      { $unwind: '$interests' },

      // 4. when filtering, drop the matched users' other interests
      ...(filter ? [{ $match: filter }] : []),

      // 5. group
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          users: { $push: { _id: '$_id', name: '$name' } },
        },
      },

      // 6. most popular first, then alphabetical (stable order for paging)
      { $sort: { count: -1, _id: 1 } },

      // 7. total + page in the same call
      {
        $facet: {
          meta: [{ $count: 'total' }],
          data: [
            { $skip: toSkip(query) },
            { $limit: query.limit },
            { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } },
          ],
        },
      },
    ]);

    const total = result?.meta[0]?.total ?? 0;
    const extra: Record<string, string> = query.interests?.length
      ? { interests: query.interests.join(',') }
      : {};
    return paginated(result?.data ?? [], total, query, '/users/grouped-by-interests', extra);
  },
};
