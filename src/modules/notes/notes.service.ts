import { Note } from './note.model';
import { AppError } from '../../utils/app-error';
import { paginated, toSkip } from '../../utils/pagination';
import type { PaginationQuery } from '../../utils/schemas';
import { toNoteResponse } from './note.serializer';
import type { CreateNoteInput, UpdateNoteInput } from './notes.schemas';

const FIELDS = 'title content createdAt updatedAt';

export const notesService = {
  async list(ownerId: string, query: PaginationQuery) {
    // both use the { owner: 1, _id: -1 } index
    const [notes, total] = await Promise.all([
      Note.find({ owner: ownerId })
        .sort({ _id: -1 })
        .skip(toSkip(query))
        .limit(query.limit)
        .select(FIELDS)
        .lean(),
      Note.countDocuments({ owner: ownerId }),
    ]);
    return paginated(notes.map(toNoteResponse), total, query, '/notes');
  },

  async getOne(ownerId: string, id: string) {
    const note = await Note.findOne({ _id: id, owner: ownerId }).select(FIELDS).lean();
    if (!note) throw new AppError(404, 'Note not found');
    return toNoteResponse(note);
  },

  async create(ownerId: string, input: CreateNoteInput) {
    const note = await Note.create({ ...input, owner: ownerId });
    return toNoteResponse(note);
  },

  async update(ownerId: string, id: string, input: UpdateNoteInput) {
    const note = await Note.findOneAndUpdate({ _id: id, owner: ownerId }, input, {
      new: true,
      runValidators: true,
    })
      .select(FIELDS)
      .lean();
    if (!note) throw new AppError(404, 'Note not found');
    return toNoteResponse(note);
  },

  async remove(ownerId: string, id: string) {
    const note = await Note.findOneAndDelete({ _id: id, owner: ownerId }).select('_id').lean();
    if (!note) throw new AppError(404, 'Note not found');
  },
};