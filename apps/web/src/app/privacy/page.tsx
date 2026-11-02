import Link from "next/link";

export const metadata = { title: "Privacy Policy | Humzubaan" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-10 text-sm leading-relaxed">
      <Link href="/" className="text-lg font-bold">
        Humzubaan
      </Link>
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-zinc-500">Aakhri update: November 2026. (Draft: public release se pehle khud parh kar tasdeeq karein.)</p>

      <h2 className="font-semibold">Hum kya jama karte hain</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account ki maloomat: naam, email, aur password (sirf hash ki shakal mein, asli password hamare paas nahi hota).</li>
        <li>Istemal ka hisaab: roz kitni translations hui aur kitne AI tokens lage. Is mein aap ka text shamil nahi hota.</li>
        <li>Saved translations: <strong>sirf wohi</strong> jo aap khud "Save" dabayen.</li>
        <li>Login ke liye ek session cookie (website) ya extension ki local storage (extension).</li>
      </ul>

      <h2 className="font-semibold">Aap ka text kab aur kahan jata hai</h2>
      <p>
        Fiverr ya kisi aur page ka text hum tab tak nahi dekhte jab tak aap use select kar ke Translate (ya reply
        ke liye "English reply banayen") na dabayen. Dabane par sirf wahi text (aur reply banate waqt aap ke
        select kiye hue client message ka text, jo sirf matlab samajhne ke liye hota hai) hamare server ke
        raste AI service (Groq) ko bheja jata hai, taake tarjuma ho sake. Is text ko hum database mein khud se
        save nahi karte.
      </p>
      <p>
        AI service ke apne data ke qawaid hain. Is liye bohat hassas ya private maloomat (passwords, bank
        details) translate karne se parhez karein.
      </p>

      <h2 className="font-semibold">Hum kuch khud nahi karte</h2>
      <p>
        Extension aap ki taraf se koi message send nahi karti aur Fiverr ke kisi box mein khud kuch nahi likhti.
        Hum aap ka data beichte nahi aur isharat/ads ke liye istemal nahi karte.
      </p>

      <h2 className="font-semibold">Data kahan rehta hai</h2>
      <p>Database MongoDB Atlas par, website hosting par, aur AI processing Groq par hoti hai.</p>

      <h2 className="font-semibold">Aap ke ikhtiyarat</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>History se kisi bhi saved translation ya poori history ko delete karein.</li>
        <li>Settings se account delete karein. Is se account, saved translations aur istemal ka record hamesha ke liye hat jata hai.</li>
      </ul>

      <h2 className="font-semibold">Rabta</h2>
      <p>Sawal ke liye: [yahan apni email likhein]</p>
    </main>
  );
}