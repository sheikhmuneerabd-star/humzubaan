import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humzubaan: Fiverr ke messages apni zubaan mein",
  description:
    "Fiverr client ke English messages Roman Urdu/Urdu mein samjhein aur apna reply natural English mein banayen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}