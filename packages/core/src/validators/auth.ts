import { z, type ZodType } from "zod";
import { AppError } from "../errors";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Naam kam az kam 2 harf ka ho").max(80, "Naam bohat lamba hai"),
  email: z.string().trim().toLowerCase().email("Email sahi nahi hai").max(254),
  password: z
    .string()
    .min(8, "Password kam az kam 8 characters ka ho")
    .max(72, "Password 72 characters se zyada nahi ho sakta"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email sahi nahi hai"),
  password: z.string().min(1, "Password likhein").max(72, "Password sahi nahi hai"),
});

// Data check karta hai, galat ho to AppError (400) phenkta hai
export function validate<S extends ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? "Input sahi nahi hai", 400);
  }
  return result.data;
}