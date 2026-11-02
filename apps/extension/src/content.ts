import { fiverrAdapter } from "./adapters/fiverr";
import type { ExtRequest, ExtResponse, Script, Tone, TranslateResult } from "./messages";

const MAX_CHARS = 2000;
const PREFS_KEY = "prefs";

type Prefs = { script: Script; tone: Tone; dock: "right" | "left" };
const DEFAULT_PREFS: Prefs = { script: "roman", tone: "professional", dock: "right" };

class UiError extends Error {
  authExpired = false;
}

async function call<T>(req: ExtRequest): Promise<T> {
  let res: ExtResponse<T> | undefined;
  try {
    res = await chrome.runtime.sendMessage(req);
  } catch {
    // Extension reload/update ke baad purana page ye error deta hai
    throw new UiError("Extension update ho gayi hai. Is Fiverr page ko refresh (F5) karein.");
  }
  if (!res) throw new UiError("Extension ka jawab nahi aaya. Page refresh (F5) karein.");
  if (!res.ok) {
    const err = new UiError(res.error);
    err.authExpired = !!res.authExpired;
    throw err;
  }
  return res.data;
}

async function loadPrefs(): Promise<Prefs> {
  try {
    const s = await chrome.storage.local.get(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...((s[PREFS_KEY] as Partial<Prefs> | undefined) ?? {}) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: Prefs) {
  chrome.storage.local.set({ [PREFS_KEY]: p }).catch(() => {});
}

const messageOf = (e: unknown) => (e instanceof Error ? e.message : "Kuch masla aa gaya");

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", text?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text; // textContent: page mein HTML nahi chalta
  return e;
}

const CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
.hidden { display: none !important; }
.ui {
  --bg: #ffffff; --fg: #1a1a1a; --muted: #6b7280; --border: #d4d4d8;
  --box: #f4f4f5; --accent: #4f46e5; --accent-fg: #ffffff; --error: #dc2626;
  font: 14px/1.45 system-ui, "Segoe UI", sans-serif; color: var(--fg);
}
@media (prefers-color-scheme: dark) {
  .ui { --bg: #18181b; --fg: #f4f4f5; --muted: #a1a1aa; --border: #3f3f46;
        --box: #27272a; --accent: #818cf8; --accent-fg: #18181b; --error: #f87171; }
}
.fab {
  position: fixed; z-index: 2147483647; padding: 7px 12px; border: 0; border-radius: 999px;
  background: var(--accent); color: var(--accent-fg); font: 600 13px system-ui, sans-serif;
  cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.3);
}
.panel {
  position: fixed; z-index: 2147483647; bottom: 16px; width: 380px;
  max-width: calc(100vw - 32px); max-height: calc(100vh - 32px); overflow: auto;
  background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,.35); padding: 12px;
}
.head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.head strong { flex: 1; }
.head select { width: auto; margin: 0; }
.x { border: 0; background: none; color: var(--muted); font-size: 20px; line-height: 1; cursor: pointer; }
h4 { margin: 10px 0 4px; font-size: 13px; }
.box { padding: 9px; background: var(--box); border-radius: 8px; white-space: pre-wrap; word-break: break-word; color: var(--fg); }
.note { margin: 8px 0 0; padding: 8px; border: 1px solid var(--accent); border-radius: 8px; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
.muted { color: var(--muted); font-size: 12px; margin: 6px 0 0; }
.error { color: var(--error); font-size: 13px; margin: 6px 0 0; }
hr { border: 0; border-top: 1px solid var(--border); margin: 12px 0; }
textarea, select {
  display: block; width: 100%; padding: 8px; font: inherit; color: var(--fg); background: var(--bg);
  border: 1px solid var(--border); border-radius: 8px; margin-top: 4px;
}
textarea { resize: vertical; }
.row { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
.btn { padding: 8px 12px; border: 0; border-radius: 8px; background: var(--accent); color: var(--accent-fg); font: 600 13px system-ui, sans-serif; cursor: pointer; }
.btn:disabled { opacity: .6; cursor: wait; }
.btn.alt { background: transparent; color: var(--fg); border: 1px solid var(--border); font-weight: 500; margin-top: 6px; }
`;

function init() {
  let prefs: Prefs = DEFAULT_PREFS;
  let pendingText = "";
    type SaveData = {
    translationType: "incoming" | "outgoing";
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    tone: string;
  };
  let lastIncoming: SaveData | null = null;
  let lastOutgoing: SaveData | null = null;
  let lastClientText = ""; // sirf reply samajhne ke liye, panel band hote hi mit jata hai

  /* ---------- Shadow DOM ---------- */
  const host = document.createElement("div");
  host.id = "humzubaan-root";
  host.style.all = "initial";
  const root = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = CSS;
  const ui = el("div", "ui");
  root.append(style, ui);

  /* ---------- Floating button ---------- */
  const fab = el("button", "fab hidden", "Translate");
  fab.type = "button";
  fab.addEventListener("mousedown", (e) => e.preventDefault()); // selection na toote
  fab.addEventListener("click", () => {
    if (pendingText) openPanel(pendingText);
    hideFab();
  });

  /* ---------- Panel ---------- */
  const panel = el("div", "panel hidden");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Humzubaan translator");

  const scriptSel = el("select");
  scriptSel.setAttribute("aria-label", "Urdu style");
  scriptSel.append(new Option("Roman Urdu", "roman"), new Option("اردو", "urdu"));
  const dockBtn = el("button", "x", "⇄");
  dockBtn.type = "button";
  dockBtn.title = "Panel doosri taraf le jayen";
  dockBtn.setAttribute("aria-label", "Panel doosri taraf le jayen");
  const closeBtn = el("button", "x", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Band karein");
  const head = el("div", "head");
  head.append(el("strong", "", "Humzubaan"), scriptSel, dockBtn, closeBtn);

  // Incoming (client ka message)
  const incStatus = el("p", "muted");
  const incResult = el("div", "hidden");
  const incTranslation = el("div", "box");
  incTranslation.dir = "auto";
  const incCopy = el("button", "btn alt", "Copy tarjuma");
  incCopy.type = "button";
  const incSave = el("button", "btn alt", "Save karein");
  incSave.type = "button";
  const incSummary = el("div", "box");
  incSummary.dir = "auto";
  const incNote = el("div", "note hidden");
  incNote.dir = "auto";
  const incMeta = el("p", "muted");
  incResult.append(
        el("h4", "", "Tarjuma"), incTranslation, incCopy, incSave,
    el("h4", "", "Client kya chahta hai"), incSummary, incNote, incMeta
  );

  // Outgoing (aap ka reply)
  const replyInput = el("textarea");
  replyInput.rows = 4;
  replyInput.maxLength = MAX_CHARS;
  replyInput.placeholder = "Yahan Roman Urdu ya Urdu mein likhein...";
  replyInput.dir = "auto";
  const toneSel = el("select");
  toneSel.setAttribute("aria-label", "Lehja");
  toneSel.append(
    new Option("Professional", "professional"), new Option("Friendly", "friendly"),
    new Option("Polite", "polite"), new Option("Formal", "formal"), new Option("Casual", "casual")
  );
  const replyBtn = el("button", "btn", "English reply banayen");
  replyBtn.type = "button";
  const replyRow = el("div", "row");
  replyRow.append(toneSel, replyBtn);
  const replyError = el("p", "error");
  const outResult = el("div", "hidden");
  const outTranslation = el("div", "box");
  outTranslation.dir = "auto";
  const outCopy = el("button", "btn alt", "Copy English reply");
  outCopy.type = "button";
    const outSave = el("button", "btn alt", "Save karein");
  outSave.type = "button";
  const outBack = el("div", "box");
  outBack.dir = "auto";
  const outNote = el("div", "note hidden");
  outNote.dir = "auto";
  const outMeta = el("p", "muted");
  outResult.append(
        el("h4", "", "English reply (Fiverr mein khud paste karein)"), outTranslation, outCopy, outSave,
    el("h4", "", "Check karein: is English ka matlab"), outBack, outNote, outMeta
  );
  const usageNote = el("p", "muted");

  panel.append(
    head, incStatus, incResult, el("hr"),
    el("h4", "", "Aap ka reply"), replyInput, replyRow, replyError, outResult, usageNote
  );
  ui.append(fab, panel);
  document.documentElement.append(host);

  /* ---------- Prefs ---------- */
  function applyDock() {
    const left = prefs.dock === "left";
    panel.style.left = left ? "16px" : "auto";
    panel.style.right = left ? "auto" : "16px";
  }
  applyDock();

  loadPrefs().then((p) => {
    prefs = p;
    scriptSel.value = p.script;
    toneSel.value = p.tone;
    applyDock();
  });
  scriptSel.addEventListener("change", () => {
    prefs = { ...prefs, script: scriptSel.value as Script };
    savePrefs(prefs);
  });
  toneSel.addEventListener("change", () => {
    prefs = { ...prefs, tone: toneSel.value as Tone };
    savePrefs(prefs);
  });
  dockBtn.addEventListener("click", () => {
    prefs = { ...prefs, dock: prefs.dock === "left" ? "right" : "left" };
    savePrefs(prefs);
    applyDock();
  });

  /* ---------- Copy ---------- */
  async function copyText(text: string, btn: HTMLButtonElement) {
    const original = btn.textContent ?? "Copy";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copy ho gaya ✓";
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ui.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      btn.textContent = ok ? "Copy ho gaya ✓" : "Copy nahi hua, text select kar ke Ctrl+C karein";
    }
    setTimeout(() => (btn.textContent = original), 2000);
  }
  incCopy.addEventListener("click", () => copyText(incTranslation.textContent ?? "", incCopy));
  outCopy.addEventListener("click", () => copyText(outTranslation.textContent ?? "", outCopy));

  
  async function saveItem(data: SaveData | null, btn: HTMLButtonElement, errorTarget: HTMLElement) {
    if (!data) return;
    btn.disabled = true;
    btn.textContent = "Save ho raha hai...";
    try {
      await call({ type: "SAVE_TRANSLATION", ...data });
      btn.textContent = "Save ho gaya ✓";
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Save karein";
      showError(errorTarget, e);
    }
  }
  incSave.addEventListener("click", () => saveItem(lastIncoming, incSave, incStatus));
  outSave.addEventListener("click", () => saveItem(lastOutgoing, outSave, replyError));

  /* ---------- Translate flows ---------- */
  function showError(target: HTMLElement, e: unknown) {
    target.textContent =
      e instanceof UiError && e.authExpired
        ? "Pehle toolbar ke H icon par click kar ke login karein, phir dobara try karein."
        : messageOf(e);
  }

  function setNote(box: HTMLElement, note?: string) {
    box.textContent = note ? `⚠ ${note}` : "";
    box.classList.toggle("hidden", !note);
  }

  async function runIncoming(text: string) {
    lastClientText = "";
    incResult.classList.add("hidden");
    if (text.length > MAX_CHARS) {
      incStatus.textContent = `Text bohat lamba hai (zyada se zyada ${MAX_CHARS} characters). Chhota hissa select karein.`;
      return;
    }
    incStatus.textContent = "Translate ho raha hai...";
    try {
      const r = await call<TranslateResult>({
        type: "TRANSLATE", mode: "incoming", text, script: prefs.script, tone: prefs.tone,
      });
      lastClientText = text;
            lastIncoming = {
        translationType: "incoming",
        originalText: text,
        translatedText: r.translation,
        sourceLanguage: r.detectedLanguage,
        targetLanguage: prefs.script === "roman" ? "Roman Urdu" : "Urdu",
        tone: r.tone ?? "",
      };
      incSave.disabled = false;
      incSave.textContent = "Save karein";
      incTranslation.textContent = r.translation;
      incSummary.textContent = r.summary ?? "";
      setNote(incNote, r.note);
      incMeta.textContent = `Zubaan: ${r.detectedLanguage}${r.tone ? ` • Lehja: ${r.tone}` : ""}`;
      usageNote.textContent = `Aaj baqi translations: ${r.usage.remaining} / ${r.usage.limit}`;
      incStatus.textContent = "";
      incResult.classList.remove("hidden");
    } catch (e) {
      showError(incStatus, e);
    }
  }

  async function runOutgoing() {
    const text = replyInput.value.trim();
    replyError.textContent = "";
    if (!text) {
      replyError.textContent = "Pehle apna reply likhein.";
      return;
    }
    replyBtn.disabled = true;
    replyBtn.textContent = "Ban raha hai...";
    try {
      const r = await call<TranslateResult>({
        type: "TRANSLATE",
        mode: "outgoing",
        text,
        script: prefs.script,
        tone: toneSel.value as Tone,
        context: lastClientText.slice(0, 1000) || undefined,
      });
      outTranslation.textContent = r.translation;
            lastOutgoing = {
        translationType: "outgoing",
        originalText: text,
        translatedText: r.translation,
        sourceLanguage: r.detectedLanguage,
        targetLanguage: "English",
        tone: toneSel.value,
      };
      outSave.disabled = false;
      outSave.textContent = "Save karein";
      outBack.textContent = r.backTranslation ?? "";
      setNote(outNote, r.note);
      outMeta.textContent = `Aap ne likha: ${r.detectedLanguage}`;
      usageNote.textContent = `Aaj baqi translations: ${r.usage.remaining} / ${r.usage.limit}`;
      outResult.classList.remove("hidden");
    } catch (e) {
      outResult.classList.add("hidden");
      showError(replyError, e);
    } finally {
      replyBtn.disabled = false;
      replyBtn.textContent = "English reply banayen";
    }
  }
  replyBtn.addEventListener("click", runOutgoing);

  /* ---------- Panel kholna / band karna ---------- */
  function openPanel(text: string) {
    incStatus.textContent = "";
    replyError.textContent = "";
    outResult.classList.add("hidden");
    panel.classList.remove("hidden");
    runIncoming(text);
  }

  // Band karne par aap ka likha hua, client ka text aur nataij page se mita do
  function closePanel() {
    panel.classList.add("hidden");
    incResult.classList.add("hidden");
    outResult.classList.add("hidden");
    replyInput.value = "";
    lastIncoming = null;
    lastOutgoing = null;
    lastClientText = "";
    incStatus.textContent = "";
    replyError.textContent = "";
  }
  closeBtn.addEventListener("click", closePanel);

  // Panel ke andar typing Fiverr ke keyboard shortcuts tak na jaye
  for (const type of ["keydown", "keyup", "keypress"] as const) {
    panel.addEventListener(type, (e) => {
      e.stopPropagation();
      if (type === "keydown" && (e as KeyboardEvent).key === "Escape") closePanel();
    });
  }

  /* ---------- Selection pakadna ---------- */
  function hideFab() {
    fab.classList.add("hidden");
  }

  function checkSelection() {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || sel.rangeCount === 0 || !fiverrAdapter.shouldOffer(sel, text)) {
      hideFab();
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) {
      hideFab();
      return;
    }
    pendingText = text;
    const below = rect.bottom + 8;
    const top = below + 40 > window.innerHeight ? Math.max(8, rect.top - 44) : below;
    const left = Math.min(Math.max(8, rect.left + rect.width / 2 - 45), window.innerWidth - 120);
    fab.style.top = `${top}px`;
    fab.style.left = `${left}px`;
    fab.classList.remove("hidden");
  }

  const fromUs = (e: Event) => e.composedPath().includes(host);

  document.addEventListener("mouseup", (e) => {
    if (fromUs(e)) return;
    setTimeout(checkSelection, 10);
  });
  document.addEventListener("keyup", (e) => {
    if (fromUs(e)) return;
    if (e.key === "Shift") setTimeout(checkSelection, 10);
  });
  document.addEventListener("mousedown", (e) => {
    if (!fromUs(e)) hideFab();
  });
  window.addEventListener("scroll", hideFab, { passive: true });
}

if (fiverrAdapter.matches(window.location)) {
  init();
}