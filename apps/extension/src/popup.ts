import type { ExtRequest, ExtResponse, Mode, PublicUser, Script, Tone, TranslateResult } from "./messages";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

class ExtError extends Error {
  authExpired = false;
}

async function call<T>(req: ExtRequest): Promise<T> {
  let res: ExtResponse<T>;
  try {
    res = await chrome.runtime.sendMessage(req);
  } catch {
    throw new ExtError("Extension se rabta nahi hua. chrome://extensions mein extension reload karein.");
  }
  if (!res.ok) {
    const err = new ExtError(res.error);
    err.authExpired = !!res.authExpired;
    throw err;
  }
  return res.data;
}

const messageOf = (e: unknown) => (e instanceof Error ? e.message : "Kuch masla aa gaya");
const show = (el: HTMLElement, visible: boolean) => el.classList.toggle("hidden", !visible);

let authMode: "login" | "register" = "login";
let mode: Mode = "incoming";
let lastTranslation = "";

/* ---------- Login / Register ---------- */

function setAuthMode(m: "login" | "register") {
  authMode = m;
  $("auth-title").textContent = m === "login" ? "Login" : "Naya account";
  $("auth-submit").textContent = m === "login" ? "Login" : "Register";
  $("auth-toggle").textContent =
    m === "login" ? "Account nahi hai? Register karein" : "Pehle se account hai? Login karein";
  show($("name-row"), m === "register");
  $("auth-error").textContent = "";
}

function showAuth() {
  show($("view-auth"), true);
  show($("view-main"), false);
  show($("logout"), false);
  $("who").textContent = "";
}

function showMain(user: PublicUser) {
  show($("view-auth"), false);
  show($("view-main"), true);
  show($("logout"), true);
  $("who").textContent = user.name;
  setMode(mode);
}

async function submitAuth() {
  const email = $<HTMLInputElement>("email").value.trim();
  const password = $<HTMLInputElement>("password").value;
  const name = $<HTMLInputElement>("name").value.trim();
  const btn = $<HTMLButtonElement>("auth-submit");

  btn.disabled = true;
  $("auth-error").textContent = "";
  try {
    const user = await call<PublicUser>(
      authMode === "login"
        ? { type: "LOGIN", email, password }
        : { type: "REGISTER", name, email, password }
    );
    $<HTMLInputElement>("password").value = "";
    showMain(user);
  } catch (e) {
    $("auth-error").textContent = messageOf(e);
  } finally {
    btn.disabled = false;
  }
}

/* ---------- Translate ---------- */

function setMode(m: Mode) {
  mode = m;
  $("tab-incoming").classList.toggle("active", m === "incoming");
  $("tab-outgoing").classList.toggle("active", m === "outgoing");
  $("input-label").textContent =
    m === "incoming"
      ? "Client ka English message paste karein:"
      : "Apna reply Roman Urdu ya Urdu mein likhein:";
  show($("tone-row"), m === "outgoing");
  show($("result"), false);
  $("error").textContent = "";
}

function renderResult(r: TranslateResult) {
  lastTranslation = r.translation;
  const incoming = r.mode === "incoming";

  $("res-title").textContent = incoming ? "Tarjuma" : "English reply (Fiverr mein paste karein)";
  $("res-translation").textContent = r.translation;

  show($("extra"), true);
  if (incoming) {
    $("extra-title").textContent = "Client kya chahta hai";
    $("res-extra").textContent = r.summary ?? "";
    $("res-meta").textContent = `Zubaan: ${r.detectedLanguage}${r.tone ? ` • Lehja: ${r.tone}` : ""}`;
  } else {
    $("extra-title").textContent = "Check karein: is English ka matlab";
    $("res-extra").textContent = r.backTranslation ?? "";
    $("res-meta").textContent = `Aap ne likha: ${r.detectedLanguage}`;
  }

  $("copy").textContent = "Copy";
  show($("result"), true);
  $("usage").textContent = `Aaj baqi translations: ${r.usage.remaining} / ${r.usage.limit}`;
}

async function translate() {
  const text = $<HTMLTextAreaElement>("text").value.trim();
  const script = $<HTMLSelectElement>("script").value as Script;
  const tone = $<HTMLSelectElement>("tone").value as Tone;
  const btn = $<HTMLButtonElement>("go");

  $("error").textContent = "";
  if (!text) {
    $("error").textContent = "Pehle text likhein.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Translate ho raha hai...";
  try {
    renderResult(await call<TranslateResult>({ type: "TRANSLATE", mode, text, script, tone }));
  } catch (e) {
    show($("result"), false);
    if (e instanceof ExtError && e.authExpired) {
      showAuth();
      $("auth-error").textContent = "Session khatam ho gaya, dobara login karein.";
    } else {
      $("error").textContent = messageOf(e);
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Translate";
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(lastTranslation);
    $("copy").textContent = "Copy ho gaya ✓";
  } catch {
    $("copy").textContent = "Copy nahi hua, text select kar ke Ctrl+C karein";
  }
}

/* ---------- Shuruaat ---------- */

$("auth-submit").addEventListener("click", submitAuth);
$("password").addEventListener("keydown", (e) => {
  if ((e as KeyboardEvent).key === "Enter") submitAuth();
});
$("auth-toggle").addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
$("logout").addEventListener("click", async () => {
  await call({ type: "LOGOUT" }).catch(() => {});
  showAuth();
});
$("tab-incoming").addEventListener("click", () => setMode("incoming"));
$("tab-outgoing").addEventListener("click", () => setMode("outgoing"));
$("go").addEventListener("click", translate);
$("copy").addEventListener("click", copyResult);

(async () => {
  setAuthMode("login");
  try {
    const user = await call<PublicUser | null>({ type: "GET_SESSION" });
    if (user) showMain(user);
    else showAuth();
  } catch (e) {
    showAuth();
    $("auth-error").textContent = messageOf(e);
  }
})();