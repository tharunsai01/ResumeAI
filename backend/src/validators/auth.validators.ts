import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a number');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password,
    role: z.enum(['candidate', 'recruiter']),
    companyName: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().min(1).max(150).optional()),
  })
  .refine((d) => d.role !== 'recruiter' || !!d.companyName, {
    message: 'companyName is required for recruiters',
    path: ['companyName'],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({ token: z.string().min(20).max(200) });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password,
});

export const googleSchema = z.object({
  credential: z.string().min(10).optional(),
  code: z.string().min(5).optional(),
  accessToken: z.string().min(10).optional(),
  redirectUri: z.string().url().optional(),
  role: z.enum(['candidate', 'recruiter']).optional(),
  companyName: z.string().trim().min(1).max(150).optional(),
}).refine(data => !!(data.credential || data.code || data.accessToken), {
  message: 'Either credential (ID token), code, or accessToken must be provided',
});

export const linkedinSchema = z.object({
  code: z.string().min(5),
  redirectUri: z.string().url().optional(),
  role: z.enum(['candidate', 'recruiter']).optional(),
  companyName: z.string().trim().min(1).max(150).optional(),
});

export type GoogleInput = z.infer<typeof googleSchema>;
export type LinkedInInput = z.infer<typeof linkedinSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
