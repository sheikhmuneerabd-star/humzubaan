const steps = [
  ["Server chalayein", "Abhi development mein hain, isliye project ka server (npm run dev) chalna chahiye."],
  ["Extension build karein", "Terminal mein: cd apps\\extension, phir npm run build. Is se dist folder banta hai."],
  ["Chrome mein load karein", "chrome://extensions kholein, Developer mode on karein, Load unpacked dabayen aur apps\\extension\\dist folder chunein."],
  ["Pin karein", "Toolbar mein puzzle icon se Humzubaan ko pin karein."],
  ["Login karein", "H icon par click karein aur isi email aur password se login karein. Website aur extension ke login alag alag chalte hain."],
  ["Fiverr par istemal", "Fiverr inbox mein message select karein. Translate button aayega. Panel mein reply likhein, English reply copy karein, khud paste karein aur khud Send dabayen."],
];

export default function ExtensionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chrome extension setup</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Abhi extension Chrome Web Store par nahi hai, isliye neeche ke steps se lagayen. Store par aane ke baad
        ye ek click ka kaam hoga.
      </p>
      <ol className="space-y-3">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-xl border border-indigo-300 p-4 text-sm dark:border-indigo-800">
        Extension aap ke liye kuch bhi khud send nahi karti. Aap khud copy, paste aur Send karte hain. Save sirf
        tab hota hai jab aap Save button dabayen.
      </p>
    </div>
  );
}