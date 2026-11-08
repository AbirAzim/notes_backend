import { z } from 'zod';

const title = z.string().trim().min(1).max(200);
const body = z.string().trim().min(1).max(10_000);

export const createPostSchema = z.object({ title, body }).strict();

export const updatePostSchema = z
  .object({ title: title.optional(), body: body.optional() })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
