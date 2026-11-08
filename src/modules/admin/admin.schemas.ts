import { z } from 'zod';
import { ROLES } from '../users/user.model';
import { interestsSchema } from '../users/users.schemas';

export const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    role: z.enum(ROLES).optional(),
    interests: interestsSchema.optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export const inviteSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    role: z.enum(ROLES),
  })
  .strict();

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;