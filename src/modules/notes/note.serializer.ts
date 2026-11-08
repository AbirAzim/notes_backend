import type { INote } from './note.model';
import { link } from '../../utils/pagination';

type NoteFields = Pick<INote, '_id' | 'title' | 'content' | 'createdAt' | 'updatedAt'>;

export function toNoteResponse(note: NoteFields) {
  const self = `/notes/${note._id}`;
  return {
    _id: note._id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    _links: {
      self: link(self),
      update: link(self, 'PATCH'),
      delete: link(self, 'DELETE'),
    },
  };
}