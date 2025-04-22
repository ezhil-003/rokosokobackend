import { z } from "zod";

export const customLoginSchema = z.object({
  auth_provider: z.literal("custom"),
  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters long"),
});

export const socialLoginSchema = z.object({
  auth_provider: z.enum(["google", "facebook"]),
  user: z.object({
    uid: z
      .string()
      .min(1, "UID is required for social login"),
    displayName: z
      .string()
      .min(1, "Display name is required"),
    email: z
      .string()
      .email("Invalid email address"),
    photoURL: z
      .string()
      .optional(),
    mobile: z
      .string()
      .regex(/^\d{10,15}$/, "Invalid mobile number")
      .optional()
      .or(z.literal("")),
    country: z
      .string()
      .min(1, "Country is required")
      .optional()
      .or(z.literal("")),
    stsTokenManager: z.object({
      accessToken: z
        .string()
        .min(1, "Access token is required"),
      refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
      endsAt: z
        .number()
        .min(Date.now(), "Token expiration must be in the future"),
    }),
  }),
});