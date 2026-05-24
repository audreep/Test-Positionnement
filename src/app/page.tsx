/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, Sparkles, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* En-tête blanc avec logo + nav */}
      <header className="border-b bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo />
          <nav className="text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Espace admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Bandeau bêta */}
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="container-app py-2 text-center text-xs text-amber-800">
          <strong>Version bêta</strong> — cette application est en cours d&apos;évolution.
          Des erreurs peuvent survenir ; merci de nous les signaler.
        </div>
      </div>

      {/* Hero teal marqué */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Bandeau décoratif doré */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden />
        <div className="container-app py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">
              {t.marque.tagline}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t.test.titre}
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/90">
              {t.test.sous_titre}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              >
                <Link href="/test">
                  {t.test.commencer}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-primary-foreground/80">
                ⏱ {t.test.duree_estimee}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu (piliers + note importante) sur fond clair */}
      <section className="container-app flex-1 py-16">
        {/* Trois piliers */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            {
              icone: ClipboardCheck,
              titre: "Adaptatif",
              texte:
                "Les questions s'ajustent à votre niveau réel pour ne pas vous faire perdre de temps."
            },
            {
              icone: BarChart3,
              titre: "6 domaines évalués",
              texte:
                "Formules, TCD, modélisation financière, VBA, Power Query, Power Pivot."
            },
            {
              icone: Sparkles,
              titre: "Recommandations personnalisées",
              texte:
                "Recevez un rapport avec les formations qui combleront vos lacunes."
            }
          ].map((bloc) => (
            <div
              key={bloc.titre}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-accent/15 group-hover:text-accent">
                <bloc.icone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{bloc.titre}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{bloc.texte}</p>
            </div>
          ))}
        </div>

        {/* Note d'information / décharge de responsabilité */}
        <div className="mx-auto mt-12 max-w-3xl rounded-md border bg-muted/30 p-5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Note importante</p>
          <p className="mt-2">
            Ce test est fourni à titre informatif uniquement. Le CFO Masqué ne garantit
            pas la compétence des participants : les tests ne sont pas surveillés et ne
            permettent pas de valider l&apos;authenticité des réponses fournies. Le CFO
            Masqué ne pourra être tenu responsable si un participant obtient un résultat
            supérieur à ses compétences réelles (par exemple en utilisant une aide externe
            pendant le test).
          </p>
        </div>
      </section>

      {/* Footer teal marqué */}
      <footer className="bg-primary text-primary-foreground">
        <div className="container-app py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Logo className="brightness-0 invert" />
              <span className="text-xs text-primary-foreground/70">
                © {new Date().getFullYear()} Le CFO Masqué Inc.
              </span>
            </div>
            <div className="flex items-center gap-4 text-primary-foreground/80">
              <a href="https://www.facebook.com/lecfomasque/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-accent">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/lecfomasque/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-accent">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/le-cfo-masqu%C3%A9" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-accent">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/lecfomasque" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-accent">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-foreground/70 hover:text-accent"
            >
              Politique de confidentialité
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
