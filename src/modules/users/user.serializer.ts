import type { IUser } from './user.model';
import { link } from '../../utils/pagination';

export function toUserResponse(user: IUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    interests: user.interests,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    _links: {
      self: link('/users/me'),
      posts: link(`/users/${user._id}/posts`),
    },
  };
}
