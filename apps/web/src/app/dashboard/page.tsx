"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/components/session";
import { apiFetch, errorMessage } from "@/lib/client";

type Usage = { used: number; limit: number; remaining: number; tokensUsed: number };

export default function Overview() {
  const user = useUser();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Usage>("/api/usage/me")
      .then(setUsage)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const percent = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Salam, {user.name}</h1>

      <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="font-semibold">Aaj ki translations</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {usage && (
          <>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {usage.used} istemal hui, {usage.remaining} baqi (roz ki limit {usage.limit}).
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full bg-indigo-600" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Limit rozana subah takreeban 5 baje (Pakistan) reset hoti hai.</p>
          </>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/extension" className="rounded-xl border border-zinc-200 p-5 hover:border-indigo-500 dark:border-zinc-800">
          <h2 className="font-semibold">Chrome extension lagayen</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Fiverr par istemal ke liye.</p>
        </Link>
        <Link href="/dashboard/history" className="rounded-xl border border-zinc-200 p-5 hover:border-indigo-500 dark:border-zinc-800">
          <h2 className="font-semibold">Saved translations</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Jo aap ne Save kiya, dekhein aur search karein.</p>
        </Link>
      </div>
    </div>
  );
}