import { z } from "zod";

export const saveTranslationSchema = z.object({
  translationType: z.enum(["incoming", "outgoing"], { message: "translationType sahi nahi hai" }),
  originalText: z.string().trim().min(1, "Original text khali hai").max(2000, "Original text bohat lamba hai"),
  translatedText: z.string().trim().min(1, "Tarjuma khali hai").max(4000, "Tarjuma bohat lamba hai"),
  sourceLanguage: z.string().trim().max(50).default(""),
  targetLanguage: z.string().trim().max(50).default(""),
  tone: z.string().trim().max(30).default(""),
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(100, "Search text bohat lamba hai").optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});