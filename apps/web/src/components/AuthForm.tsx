"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, errorMessage } from "@/lib/client";

const input =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Pehle se login ho to seedha dashboard
  useEffect(() => {
    apiFetch("/api/users/me")
      .then(() => router.replace("/dashboard"))
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiFetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: isLogin ? { email, password } : { name, email, password },
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-6 text-lg font-bold">
        Humzubaan
      </Link>
      <h1 className="text-2xl font-semibold">{isLogin ? "Login" : "Naya account banayen"}</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {!isLogin && (
          <label className="block text-sm">
            Naam
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
        )}
        <label className="block text-sm">
          Email
          <input
            className={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={isLogin ? 1 : 8}
          />
          {!isLogin && <span className="text-xs text-zinc-500">Kam az kam 8 characters</span>}
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {busy ? "Intezar karein..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        {isLogin ? "Account nahi hai? " : "Pehle se account hai? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-indigo-600 dark:text-indigo-400">
          {isLogin ? "Register karein" : "Login karein"}
        </Link>
      </p>
    </main>
  );
}