"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUser } from "@/components/session";
import { apiFetch, errorMessage } from "@/lib/client";

const input =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const primary =
  "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60";
const card = "rounded-xl border border-zinc-200 p-5 dark:border-zinc-800";

type Msg = { ok: boolean; text: string } | null;

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p role="alert" className={`mt-3 text-sm ${msg.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {msg.text}
    </p>
  );
}

export default function SettingsPage() {
  const user = useUser();
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const [nameBusy, setNameBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [delMsg, setDelMsg] = useState<Msg>(null);
  const [delBusy, setDelBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    setNameMsg(null);
    try {
      await apiFetch("/api/users/me", { method: "PATCH", body: { name } });
      setNameMsg({ ok: true, text: "Naam save ho gaya. Naya naam agli dafa page kholne par dikhega." });
    } catch (err) {
      setNameMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setNameBusy(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    setPwMsg(null);
    try {
      await apiFetch("/api/users/me/password", { method: "POST", body: { currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      setPwMsg({
        ok: true,
        text: "Password badal gaya. Chrome extension se dobara login karna parega, ye normal hai.",
      });
    } catch (err) {
      setPwMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setPwBusy(false);
    }
  }

  async function removeAccount(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Account aur saari saved translations hamesha ke liye delete ho jayengi. Pakka?")) return;
    setDelBusy(true);
    setDelMsg(null);
    try {
      await apiFetch("/api/users/me", { method: "DELETE", body: { password: deletePassword } });
      router.replace("/");
    } catch (err) {
      setDelMsg({ ok: false, text: errorMessage(err) });
      setDelBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className={card}>
        <h2 className="font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-zinc-500">Email: {user.email}</p>
        <form onSubmit={saveName} className="mt-3 max-w-sm">
          <label className="block text-sm">
            Naam
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} />
          </label>
          <button className={`${primary} mt-3`} disabled={nameBusy}>
            {nameBusy ? "Save ho raha hai..." : "Naam save karein"}
          </button>
          <Message msg={nameMsg} />
        </form>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Password badlein</h2>
        <form onSubmit={savePassword} className="mt-3 max-w-sm space-y-3">
          <label className="block text-sm">
            Maujooda password
            <input className={input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <label className="block text-sm">
            Naya password
            <input className={input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
            <span className="text-xs text-zinc-500">Kam az kam 8 characters</span>
          </label>
          <button className={primary} disabled={pwBusy}>
            {pwBusy ? "Intezar karein..." : "Password badlein"}
          </button>
          <Message msg={pwMsg} />
        </form>
      </section>

      <section className="rounded-xl border border-red-300 p-5 dark:border-red-900">
        <h2 className="font-semibold text-red-700 dark:text-red-400">Account delete karein</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Aap ka account, saved translations aur istemal ka record hamesha ke liye delete ho jayega. Ye wapas nahi ho sakta.
        </p>
        <form onSubmit={removeAccount} className="mt-3 max-w-sm space-y-3">
          <label className="block text-sm">
            Tasdeeq ke liye password
            <input className={input} type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60" disabled={delBusy}>
            {delBusy ? "Delete ho raha hai..." : "Account delete karein"}
          </button>
          <Message msg={delMsg} />
        </form>
      </section>
    </div>
  );
}