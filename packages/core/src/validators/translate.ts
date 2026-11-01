import { z } from "zod";

export const translateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Text likhein")
    .max(2000, "Text bohat lamba hai (zyada se zyada 2000 characters)"),
  mode: z.enum(["incoming", "outgoing"], { message: "mode 'incoming' ya 'outgoing' hona chahiye" }),
  script: z.enum(["roman", "urdu"]).default("roman"),
  tone: z.enum(["professional", "friendly", "polite", "formal", "casual"]).default("professional"),
});