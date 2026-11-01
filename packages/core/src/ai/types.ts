export type Script = "roman" | "urdu";
export type Tone = "professional" | "friendly" | "polite" | "formal" | "casual";

export type IncomingResult = {
  detectedLanguage: string;
  translation: string;
  summary: string;
  tone: string;
};

export type OutgoingResult = {
  detectedLanguage: string;
  translation: string;
  backTranslation: string;
};

export type WithTokens<T> = { result: T; tokens: number };

// Har AI provider (Groq, baad mein OpenAI/Gemini) is shape ko follow karega
export interface AIProvider {
  readonly name: string;
  translateIncoming(input: { text: string; script: Script }): Promise<WithTokens<IncomingResult>>;
  translateOutgoing(input: {
    text: string;
    script: Script;
    tone: Tone;
  }): Promise<WithTokens<OutgoingResult>>;
}