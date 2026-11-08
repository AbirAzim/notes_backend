import type { IUser } from '../users/user.model';
import type { INote } from '../notes/note.model';
import { link } from '../../utils/pagination';

export function toAdminUserResponse(user: IUser, currentAdminId: string) {
  const self = `/admin/users/${user._id}`;
  const isSelf = String(user._id) === currentAdminId;
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
      update: link(self, 'PATCH'),
      ...(!isSelf && { delete: link(self, 'DELETE') }),
      posts: link(`/users/${user._id}/posts`),
    },
  };
}

type AdminNote = Pick<INote, '_id' | 'title' | 'content' | 'createdAt' | 'updatedAt'> & {
  owner: { _id: unknown; name: string } | null;
};

export function toAdminNoteResponse(note: AdminNote) {
  return {
    _id: note._id,
    title: note.title,
    content: note.content,
    owner: note.owner ? { _id: note.owner._id, name: note.owner.name } : null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    _links: note.owner ? { ownerPosts: link(`/users/${note.owner._id}/posts`) } : {},
  };
}
