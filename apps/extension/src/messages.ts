export type Mode = "incoming" | "outgoing";
export type Script = "roman" | "urdu";
export type Tone = "professional" | "friendly" | "polite" | "formal" | "casual";

export type PublicUser = { id: string; name: string; email: string };
export type Session = { token: string; user: PublicUser };

export type TranslateResult = {
  mode: Mode;
  detectedLanguage: string;
  translation: string;
  summary?: string;
  tone?: string;
  backTranslation?: string;
  usage: { used: number; limit: number; remaining: number };
};

export type ExtRequest =
  | { type: "GET_SESSION" }
  | { type: "LOGIN"; email: string; password: string }
  | { type: "REGISTER"; name: string; email: string; password: string }
  | { type: "LOGOUT" }
  | { type: "TRANSLATE"; mode: Mode; text: string; script: Script; tone: Tone };

export type ExtResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; authExpired?: boolean };