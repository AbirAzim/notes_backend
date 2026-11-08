import { z } from 'zod';
import { ROLES } from '../users/user.model';
import { interestsSchema } from '../users/users.schemas';

// admin can change name, role and interests — never email or password
export const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    role: z.enum(ROLES).optional(),
    interests: interestsSchema.optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
