import { z } from 'zod';
import { ROLES } from '../users/user.model';
import { interestsSchema } from '../users/users.schemas';
import { registerSchema } from '../auth/auth.schemas';

// admin creates an account: same name/email/password rules as registration, plus role and interests
export const adminCreateUserSchema = registerSchema.extend({
  role: z.enum(ROLES).default('USER'),
  interests: interestsSchema.optional(),
});

// admin can change name, role and interests — never email or password
export const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    role: z.enum(ROLES).optional(),
    interests: interestsSchema.optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
