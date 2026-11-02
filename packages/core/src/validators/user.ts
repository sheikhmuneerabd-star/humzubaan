import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Naam kam az kam 2 harf ka ho").max(80, "Naam bohat lamba hai"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Maujooda password likhein").max(72),
  newPassword: z
    .string()
    .min(8, "Naya password kam az kam 8 characters ka ho")
    .max(72, "Password 72 characters se zyada nahi ho sakta"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password likhein").max(72),
});