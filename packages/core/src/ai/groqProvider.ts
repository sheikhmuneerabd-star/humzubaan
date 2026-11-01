import { z } from "zod";
import { AppError } from "../errors";
import { incomingSystemPrompt, outgoingSystemPrompt } from "./prompts";
import type {
  AIProvider,
  IncomingResult,
  OutgoingResult,
  Script,
  Tone,
  WithTokens,
} from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 25_000;

const incomingSchema = z.object({
  detectedLanguage: z.string().min(1),
  translation: z.string().min(1),
  summary: z.string().default(""),
  tone: z.string().default(""),
});

const outgoingSchema = z.object({
  detectedLanguage: z.string().min(1),
  translation: z.string().min(1),
  backTranslation: z.string().default(""),
});

const BAD_REPLY = "AI ka jawab samajh nahi aaya. Dobara try karein.";

function extractJson(text: string): unknown {
  // Kuch models <think>...</think> likhte hain, usay hata dete hain
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AppError(BAD_REPLY, 502);
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AppError(BAD_REPLY, 502);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  constructor(
    private apiKey: string,
    private model: string,
    private maxOutputTokens = 1500
  ) {}

  private send(system: string, userContent: string, jsonMode: boolean) {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      max_completion_tokens: this.maxOutputTokens,
    };
    // Har model JSON mode support nahi karta, isliye ye optional hai
    if (jsonMode) body.response_format = { type: "json_object" };

    return fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  }

  // Network ya server (5xx) error par ek dafa dobara koshish
  private async request(system: string, userContent: string, jsonMode: boolean) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await this.send(system, userContent, jsonMode);
        if (res.status >= 500 && attempt === 0) {
          await sleep(600);
          continue;
        }
        return res;
      } catch (error) {
        lastError = error;
        if (attempt === 0) await sleep(600);
      }
    }
    console.error("Groq network error:", lastError);
    throw new AppError("AI service tak pohanchna mumkin nahi hua. Thori dair baad try karein.", 504);
  }

  private async chat(system: string, text: string): Promise<{ content: string; tokens: number }> {
    const userContent = JSON.stringify({ message: text });

    let res = await this.request(system, userContent, true);
    if (res.status === 400) {
      res = await this.request(system, userContent, false);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Groq error", res.status, detail.slice(0, 500));

      if (res.status === 429) {
        const wait = res.headers.get("retry-after");
        throw new AppError(
          wait
            ? `AI ki limit poori ho gayi hai. ${wait} second baad dobara try karein.`
            : "AI ki limit poori ho gayi hai. Thori dair baad dobara try karein.",
          429
        );
      }
      if (res.status === 401 || res.status === 403) {
        throw new AppError("Server ki AI key mein masla hai. Admin se rabta karein.", 500);
      }
      if (res.status === 400 || res.status === 404) {
        throw new AppError("AI model ki setting mein masla hai. Admin se rabta karein.", 500);
      }
      throw new AppError("AI service abhi theek kaam nahi kar rahi. Dobara try karein.", 502);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
      usage?: { total_tokens?: number };
    };

    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";
    if (!content || choice?.finish_reason === "length") {
      console.error("Groq reply empty or cut. finish_reason:", choice?.finish_reason);
      throw new AppError(BAD_REPLY, 502);
    }

    return { content, tokens: data.usage?.total_tokens ?? 0 };
  }

  async translateIncoming(input: {
    text: string;
    script: Script;
  }): Promise<WithTokens<IncomingResult>> {
    const { content, tokens } = await this.chat(incomingSystemPrompt(input.script), input.text);
    const parsed = incomingSchema.safeParse(extractJson(content));
    if (!parsed.success) throw new AppError(BAD_REPLY, 502);
    return { result: parsed.data, tokens };
  }

  async translateOutgoing(input: {
    text: string;
    script: Script;
    tone: Tone;
  }): Promise<WithTokens<OutgoingResult>> {
    const { content, tokens } = await this.chat(
      outgoingSystemPrompt(input.script, input.tone),
      input.text
    );
    const parsed = outgoingSchema.safeParse(extractJson(content));
    if (!parsed.success) throw new AppError(BAD_REPLY, 502);
    return { result: parsed.data, tokens };
  }
}