import { z } from 'zod';

const passwordRules = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one number',
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'Password must contain at least one special character',
  });

export const changePasswordSchema = z.object({
  currentPassword: passwordRules,
  newPassword: passwordRules,
});

export const setPasswordSchema = z.object({
  password: passwordRules,
});