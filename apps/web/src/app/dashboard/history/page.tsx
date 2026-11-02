"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/client";

type Item = {
  id: string;
  type: "incoming" | "outgoing";
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  createdAt: string | null;
};
type ListResponse = { items: Item[]; total: number; page: number; pages: number };

const btn =
  "rounded-lg border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

export default function HistoryPage() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  // Typing rukne ke baad search
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(input.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      setData(await apiFetch<ListResponse>(`/api/translations?${params}`));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!window.confirm("Ye translation delete karein?")) return;
    try {
      await apiFetch(`/api/translations/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function removeAll() {
    if (!window.confirm("POORI history delete karein? Ye wapas nahi aa sakti.")) return;
    try {
      await apiFetch("/api/translations", { method: "DELETE" });
      setPage(1);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("Copy nahi hua. Text select kar ke Ctrl+C karein.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Saved translations</h1>
        {data && data.total > 0 && (
          <button onClick={removeAll} className="text-sm text-red-600 hover:underline dark:text-red-400">
            Sab delete karein
          </button>
        )}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search karein..."
        aria-label="Search"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {loading && !data && <p className="text-sm text-zinc-500">Load ho raha hai...</p>}

      {data && data.items.length === 0 && !loading && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {q
            ? "Is search se kuch nahi mila."
            : "Abhi kuch save nahi hua. Fiverr panel mein tarjuma ke neeche Save karein dabayen."}
        </p>
      )}

      <ul className="space-y-3">
        {data?.items.map((item) => (
          <li key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {item.type === "incoming" ? "Client ka message" : "Mera reply"}
              </span>
              <span>
                {item.sourceLanguage} → {item.targetLanguage}
              </span>
              {item.createdAt && <span>{new Date(item.createdAt).toLocaleString("en-GB")}</span>}
            </div>

            <p className="mt-3 text-xs font-medium text-zinc-500">Original</p>
            <p dir="auto" className="whitespace-pre-wrap break-words text-sm">
              {item.originalText}
            </p>
            <p className="mt-3 text-xs font-medium text-zinc-500">Tarjuma</p>
            <p dir="auto" className="whitespace-pre-wrap break-words text-sm">
              {item.translatedText}
            </p>

            <div className="mt-3 flex gap-2">
              <button className={btn} onClick={() => copy(item.id, item.translatedText)}>
                {copied === item.id ? "Copy ho gaya ✓" : "Tarjuma copy"}
              </button>
              <button className={btn} onClick={() => remove(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm">
          <button className={btn} disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            Pehle
          </button>
          <span>
            {data.page} / {data.pages}
          </span>
          <button className={btn} disabled={page >= data.pages || loading} onClick={() => setPage((p) => p + 1)}>
            Agle
          </button>
        </div>
      )}
    </div>
  );
}