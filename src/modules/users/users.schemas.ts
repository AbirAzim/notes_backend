import { z } from 'zod';
import { paginationSchema } from '../../utils/schemas';

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

// Scenario 1: ?interests=chess,reading&page=1&limit=10
export const groupedByInterestsQuerySchema = paginationSchema.extend({
  interests: z
    .string()
    .max(500)
    .optional()
    .transform((s) =>
      s
        ? [
            ...new Set(
              s
                .split(',')
                .map((i) => i.trim().toLowerCase())
                .filter(Boolean),
            ),
          ]
        : undefined,
    )
    .refine((list) => !list || list.length <= 20, { message: 'At most 20 interests' }),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type GroupedByInterestsQuery = z.infer<typeof groupedByInterestsQuerySchema>;
