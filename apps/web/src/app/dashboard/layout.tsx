"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SessionContext, type SessionUser } from "@/components/session";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/client";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/extension", label: "Extension" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: SessionUser }>("/api/users/me")
      .then((d) => {
        if (!cancelled) setUser(d.user);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiClientError && e.status === 401) router.replace("/login");
        else setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!user) return <p className="p-6 text-zinc-500">Load ho raha hai...</p>;

  return (
    <SessionContext.Provider value={user}>
      <div className="mx-auto max-w-4xl px-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 py-4 dark:border-zinc-800">
          <Link href="/dashboard" className="text-lg font-bold">
            Humzubaan
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-1.5 ${
                  pathname === n.href
                    ? "bg-indigo-600 font-semibold text-white"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <button onClick={logout} className="ml-2 rounded-lg px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Logout
            </button>
          </nav>
        </header>
        <main className="py-6">{children}</main>
      </div>
    </SessionContext.Provider>
  );
}