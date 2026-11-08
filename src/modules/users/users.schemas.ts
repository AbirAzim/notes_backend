import { z } from 'zod';

export const interestsSchema = z
  .array(z.string().trim().toLowerCase().min(1).max(50))
  .max(20)
  .transform((list) => [...new Set(list)]);

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    interests: interestsSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
