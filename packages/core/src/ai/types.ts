export type Script = "roman" | "urdu";
export type Tone = "professional" | "friendly" | "polite" | "formal" | "casual";

export type IncomingResult = {
  detectedLanguage: string;
  translation: string;
  summary: string;
  tone: string;
  note: string;
};

export type OutgoingResult = {
  detectedLanguage: string;
  translation: string;
  backTranslation: string;
  note: string;
};

export type WithTokens<T> = { result: T; tokens: number };

export interface AIProvider {
  readonly name: string;
  translateIncoming(input: { text: string; script: Script }): Promise<WithTokens<IncomingResult>>;
  translateOutgoing(input: {
    text: string;
    script: Script;
    tone: Tone;
    context?: string;
  }): Promise<WithTokens<OutgoingResult>>;
}