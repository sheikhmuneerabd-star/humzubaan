import { API_BASE } from "./config";
import type { ExtRequest, ExtResponse, PublicUser, Session, TranslateResult } from "./messages";

const SESSION_KEY = "session";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function getSession(): Promise<Session | null> {
  const stored = await chrome.storage.local.get(SESSION_KEY);
  return (stored[SESSION_KEY] as Session | undefined) ?? null;
}

async function api<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError("Server se rabta nahi ho raha. Internet ya server check karein.", 0);
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? "Kuch masla aa gaya", res.status);
  return data;
}

async function handle(req: ExtRequest): Promise<unknown> {
  switch (req.type) {
    case "GET_SESSION": {
      const session = await getSession();
      return session ? session.user : null; // token popup ko nahi jata
    }

    case "LOGIN":
    case "REGISTER": {
      const isLogin = req.type === "LOGIN";
      const session = await api<Session>(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: isLogin
          ? { email: req.email, password: req.password }
          : { name: req.name, email: req.email, password: req.password },
      });
      await chrome.storage.local.set({
        [SESSION_KEY]: { token: session.token, user: session.user },
      });
      return session.user as PublicUser;
    }

    case "LOGOUT": {
      await chrome.storage.local.remove(SESSION_KEY);
      return null;
    }

    case "TRANSLATE": {
      const session = await getSession();
      if (!session) throw new ApiError("Pehle login karein", 401);
      return api<TranslateResult>("/api/translate", {
        method: "POST",
        token: session.token,
        body: { mode: req.mode, text: req.text, script: req.script, tone: req.tone },
      });
    }
  }
}

async function toErrorResponse(req: ExtRequest, error: unknown): Promise<ExtResponse> {
  if (error instanceof ApiError) {
    // Token expire ya galat ho gaya: session saaf kar do taake popup login dikhaye
    if (error.status === 401 && req.type === "TRANSLATE") {
      await chrome.storage.local.remove(SESSION_KEY);
      return { ok: false, error: error.message, authExpired: true };
    }
    return { ok: false, error: error.message };
  }
  console.error(error);
  return { ok: false, error: "Extension mein masla aa gaya." };
}

// Web page ke andar chalne wala content script sirf ye 2 kaam kar sakta hai
const CONTENT_ALLOWED = new Set<ExtRequest["type"]>(["TRANSLATE", "GET_SESSION"]);

chrome.runtime.onMessage.addListener((req: ExtRequest, sender, sendResponse) => {
  // Sirf apni extension ke messages qabool karo
  if (sender.id !== chrome.runtime.id) return false;

  // Tab ke andar se aaya aur extension ka apna page nahi, to ye content script hai
  const fromContentScript =
    !!sender.tab && !(sender.url ?? "").startsWith(chrome.runtime.getURL(""));

  if (fromContentScript && !CONTENT_ALLOWED.has(req?.type)) {
    sendResponse({ ok: false, error: "Ye action yahan se allowed nahi hai." } satisfies ExtResponse);
    return false;
  }

  handle(req)
    .then((data) => sendResponse({ ok: true, data } satisfies ExtResponse))
    .catch(async (error) => sendResponse(await toErrorResponse(req, error)));

  return true; // jawab async aayega
});