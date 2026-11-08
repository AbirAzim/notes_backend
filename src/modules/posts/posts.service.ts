import { Types } from 'mongoose';
import { Post } from './post.model';
import { User } from '../users/user.model';
import { AppError } from '../../utils/app-error';
import { paginated, toSkip } from '../../utils/pagination';
import type { PaginationQuery } from '../../utils/schemas';
import { toPostResponse } from './post.serializer';
import type { CreatePostInput, UpdatePostInput } from './posts.schemas';

const FIELDS = 'author title body createdAt updatedAt';

type PostRow = {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

export const postsService = {
  async create(authorId: string, input: CreatePostInput) {
    const post = await Post.create({ ...input, author: authorId });
    return toPostResponse(post, authorId);
  },

  async getOne(callerId: string, id: string) {
    const post = await Post.findById(id).select(FIELDS).lean();
    if (!post) throw new AppError(404, 'Post not found');
    return toPostResponse(post, callerId);
  },

  async update(authorId: string, id: string, input: UpdatePostInput) {
    const post = await Post.findOneAndUpdate({ _id: id, author: authorId }, input, {
      new: true,
      runValidators: true,
    })
      .select(FIELDS)
      .lean();
    if (!post) throw new AppError(404, 'Post not found');
    return toPostResponse(post, authorId);
  },

  async remove(authorId: string, id: string) {
    const post = await Post.findOneAndDelete({ _id: id, author: authorId }).select('_id').lean();
    if (!post) throw new AppError(404, 'Post not found');
  },

  // Scenario 2: a user's posts — one aggregation pipeline with $lookup
  async listByUser(callerId: string, userId: string, query: PaginationQuery) {
    const [result] = await User.aggregate<{
      user: { _id: Types.ObjectId; name: string };
      data: PostRow[];
      total: number;
    }>([
      // 1. the user — default _id index
      { $match: { _id: new Types.ObjectId(userId) } },
      { $project: { name: 1 } },

      // 2. their posts — { author: 1, _id: -1 } index
      {
        $lookup: {
          from: Post.collection.name,
          localField: '_id',
          foreignField: 'author',
          as: 'posts',
          pipeline: [
            { $sort: { _id: -1 } }, // before $facet, so it can use the index
            {
              $facet: {
                meta: [{ $count: 'total' }],
                data: [
                  { $skip: toSkip(query) },
                  { $limit: query.limit },
                  { $project: { author: 1, title: 1, body: 1, createdAt: 1, updatedAt: 1 } },
                ],
              },
            },
          ],
        },
      },

      // 3. shape the response
      { $unwind: '$posts' },
      {
        $project: {
          _id: 0,
          user: { _id: '$_id', name: '$name' },
          data: '$posts.data',
          total: { $ifNull: [{ $first: '$posts.meta.total' }, 0] },
        },
      },
    ]);

    if (!result) throw new AppError(404, 'User not found');

    return {
      user: result.user,
      ...paginated(
        result.data.map((p) => toPostResponse(p, callerId)),
        result.total,
        query,
        `/users/${userId}/posts`,
      ),
    };
  },
};
