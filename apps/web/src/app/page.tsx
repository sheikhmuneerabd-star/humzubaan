import Link from "next/link";

const steps = [
  ["1", "Message select karein", "Fiverr par client ka English message select karein aur Translate dabayen."],
  ["2", "Apni zubaan mein samjhein", "Roman Urdu ya Urdu mein tarjuma, aur saath mein: client asal mein kya chahta hai."],
  ["3", "Apna reply likhein", "Roman Urdu ya Urdu mein likhein. Humzubaan natural, professional English bana deta hai."],
  ["4", "Check karein, copy karein", "English ka matlab wapas Roman Urdu mein dekh lein. Phir khud paste karein aur khud Send dabayen."],
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <header className="flex items-center justify-between py-5">
        <span className="text-lg font-bold">Humzubaan</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
          >
            Free account
          </Link>
        </nav>
      </header>

      <main>
        <section className="py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Fiverr ke clients se baat karein,
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">apni zubaan mein.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-zinc-600 dark:text-zinc-400">
            English mein aane wale messages Roman Urdu ya Urdu mein samjhein, aur apna jawab natural
            professional English mein banayen. Bina English seekhe.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Shuru karein
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold dark:border-zinc-700"
            >
              Login
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-2">
          {steps.map(([n, title, text]) => (
            <div key={n} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {n}
              </div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
            </div>
          ))}
        </section>

        <section className="pb-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Humzubaan aap ki taraf se kuch send nahi karta. Reply copy kar ke aap khud paste karte hain.
          Translation ke liye AI service use hoti hai, aur sirf wahi text jata hai jo aap Translate
          dabane par bhejte hain.
        </section>
      </main>
      <footer className="flex justify-center gap-4 border-t border-zinc-200 py-6 text-sm text-zinc-500 dark:border-zinc-800">
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
      </footer>
    </div>
  );
}