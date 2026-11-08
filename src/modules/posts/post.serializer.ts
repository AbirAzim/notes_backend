import type { IPost } from './post.model';
import { link } from '../../utils/pagination';

type PostFields = Pick<IPost, '_id' | 'author' | 'title' | 'body' | 'createdAt' | 'updatedAt'>;

export function toPostResponse(post: PostFields, callerId: string) {
  const self = `/posts/${post._id}`;
  const isAuthor = String(post.author) === callerId;
  return {
    _id: post._id,
    author: post.author,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    _links: {
      self: link(self),
      author: link(`/users/${post.author}/posts`),
      ...(isAuthor && { update: link(self, 'PATCH'), delete: link(self, 'DELETE') }),
    },
  };
}