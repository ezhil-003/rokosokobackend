import { z } from "zod";

// Define an enum for gender
const GenderEnum = z.enum(["male", "female", "other"]);

// Edit profile schema validation
export const editProfileSchema = z.object({
  //name: z.string().min(1).max(100).optional(), // Name can be updated, but it's optional
  username: z
    .string()
    .min(3)
    .max(10)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores.")
    .optional(),
  aboutMe: z.string().max(200).optional(),
  gender: GenderEnum.optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  mobile: z.string().min(10).max(15).optional(),
  email: z
    .string()
    .email()
    .max(100)
    .optional() // Email can also be updated with proper validation
});