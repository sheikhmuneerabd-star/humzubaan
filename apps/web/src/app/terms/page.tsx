import Link from "next/link";

export const metadata = { title: "Terms | Humzubaan" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-10 text-sm leading-relaxed">
      <Link href="/" className="text-lg font-bold">
        Humzubaan
      </Link>
      <h1 className="text-2xl font-semibold">Terms of Use</h1>
      <p className="text-zinc-500">Aakhri update: November 2026. (Draft: public release se pehle khud parh kar tasdeeq karein.)</p>

      <h2 className="font-semibold">Service</h2>
      <p>
        Humzubaan messages ka tarjuma aur reply likhne mein madad karta hai. Ye abhi muft hai, lekin roz ki
        limit hai, aur hum limit badal sakte hain ya service rok sakte hain.
      </p>

      <h2 className="font-semibold">AI ghalti kar sakta hai</h2>
      <p>
        Tarjuma AI se hota hai aur kabhi ghalat ya adhoora ho sakta hai. Qeemat, deadline, ya kisi wada jaisi
        ahem baatein bhejne se pehle khud dobara check karein ("Check karein" wala hissa is liye hai). Bheje gaye
        har message ki zimmedari aap ki hai.
      </p>

      <h2 className="font-semibold">Aap ki zimmedari</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Service ko galat, dhokebaz ya nuqsandeh kaam ke liye istemal na karein.</li>
        <li>Jis platform (jaise Fiverr) par aap istemal karte hain, uski apni shartein follow karein.</li>
        <li>Apna password mehfooz rakhein.</li>
      </ul>

      <h2 className="font-semibold">Account</h2>
      <p>Aap kabhi bhi Settings se apna account delete kar sakte hain. Hum galat istemal par account band kar sakte hain.</p>

      <h2 className="font-semibold">Zimmedari ki hadd</h2>
      <p>Service "jaisi hai waisi" di jati hai, bina kisi zamanat ke. Is ke istemal se hone wale nuqsan ke hum zimmedar nahi.</p>

      <p>
        Dekhein bhi: <Link href="/privacy" className="text-indigo-600 underline dark:text-indigo-400">Privacy Policy</Link>
      </p>
    </main>
  );
}