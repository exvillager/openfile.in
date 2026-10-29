import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const createLinkSchema = z.object({
  maxUploads: z.number({ required_error: "Max uploads is required" }).min(1),
  allowedFileType: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
  secretKey: z.string().min(1),
  iv: z.string().min(1),
});
