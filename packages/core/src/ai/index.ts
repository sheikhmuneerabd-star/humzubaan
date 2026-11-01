import { GroqProvider } from "./groqProvider";
import type { AIProvider } from "./types";

let cached: AIProvider | null = null;

// Baad mein OpenAI lagana ho to yahan ek aur `if` aayega, baaqi code wahi rahega
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const name = (process.env.AI_PROVIDER ?? "groq").toLowerCase();

  if (name === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL;
    if (!apiKey || !model) {
      throw new Error("GROQ_API_KEY aur GROQ_MODEL .env.local mein set karein");
    }
    const maxTokens = Number(process.env.GROQ_MAX_OUTPUT_TOKENS);
    cached = new GroqProvider(apiKey, model, Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 1500);
    return cached;
  }

  throw new Error(`AI_PROVIDER "${name}" supported nahi hai`);
}

export type { AIProvider } from "./types";