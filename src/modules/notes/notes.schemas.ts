import { z } from 'zod';

const title = z.string().trim().min(1).max(200);
const content = z.string().max(10_000);

export const createNoteSchema = z.object({ title, content: content.optional() }).strict();

export const updateNoteSchema = z
  .object({ title: title.optional(), content: content.optional() })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
