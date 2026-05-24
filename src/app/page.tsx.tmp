import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

/**
 * Page d'accueil publique. Présente brièvement le test et redirige vers le parcours.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Bandeau d'entête simple */}
      <header className="border-b bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" aria-hidden />
            <span className="text-lg font-semibold tracking-tight">
              {t.marque.nom}
            </span>
          </div>
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
          <strong>Version bêta</strong> — cette application est en cours
          d&apos;évolution. Des erreurs peuvent survenir ; merci de nous les
          signaler.
        </div>
      </div>

      {/* Hero */}
      <section className="container-app py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            {t.marque.tagline}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t.test.titre}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {t.test.sous_titre}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/test">
                {t.test.commencer}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              ⏱ {t.test.duree_estimee}
            </span>
          </div>

          {/* Note d'information / décharge de responsabilité */}
          <div className="mx-auto mt-10 max-w-2xl rounded-md border bg-muted/30 p-4 text-left text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Note importante</p>
            <p className="mt-1">
              Ce test est fourni à titre informatif uniquement. Le CFO Masqué
              ne garantit pas la compétence des participants : les tests ne
              sont pas surveillés et ne permettent pas de valider
              l&apos;authenticité des réponses fournies. Le CFO Masqué ne
              pourra être tenu responsable si un participant obtient un
              résultat supérieur à ses compétences réelles (par exemple en
              utilisant une aide externe pendant le test).
            </p>
          </div>
        </div>

        {/* Trois piliers / promesse */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
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
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <bloc.icone className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-4 text-base font-semibold">{bloc.titre}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{bloc.texte}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="container-app flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {t.marque.nom} Inc.</span>
          <a
            href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? "#"}
            className="hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Politique de confidentialité
          </a>
        </div>
      </footer>
    </main>
  );
}
