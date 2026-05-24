import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";
import "./globals.css";

const t = getTranslations();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: t.test.titre + " | " + t.marque.nom,
    template: "%s | " + t.marque.nom
  },
  description: t.test.sous_titre,
  openGraph: {
    title: t.test.titre + " | " + t.marque.nom,
    description: t.test.sous_titre,
    locale: "fr_CA",
    type: "website"
  },
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
