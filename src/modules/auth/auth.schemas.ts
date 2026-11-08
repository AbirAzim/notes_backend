import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(72);
const name = z.string().trim().min(2).max(60);
const token = z.string().min(1).max(2000);

export const registerSchema = z.object({ name, email, password }).strict();
export const loginSchema = z.object({ email, password: z.string().min(1).max(72) }).strict();
export const verifyEmailSchema = z.object({ token }).strict();
export const resendVerificationSchema = z.object({ email }).strict();
export const acceptInviteSchema = z.object({ token, name, password }).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
