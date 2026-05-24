import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarreNiveau } from "@/components/rapport/BarreNiveau";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chargerContexte, chargerRapport } from "@/lib/adaptive/runner";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

// Force le rendu dynamique : recalcule la chaîne de recommandations à chaque
// chargement, même si les formations changent en base. Sans ça, Next.js peut
// mettre en cache le rendu SSR et servir des recommandations obsolètes après
// une modification du catalogue.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props { params: { id: string } }

export default async function RapportPage({ params }: Props) {
  const supabase = createSupabaseAdminClient();
  const contexte = await chargerContexte(supabase);
  const rapport = await chargerRapport(supabase, params.id, contexte);
  if (!rapport) notFound();

  const recoParDomaine = new Map(
    rapport.recommandations.map((r) => [r.domaine_id, r])
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container-narrow py-12">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.marque.nom}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {t.rapport.titre}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {rapport.client.prenom} {rapport.client.nom}
          </p>
        </header>

        {/* Bandeau bêta */}
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          <strong>Version bêta</strong> — cette application est en cours
          d&apos;évolution. Des erreurs peuvent survenir ; merci de nous les
          signaler.
        </div>

        {/* Décharge de responsabilité */}
        <div className="mb-8 rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Note importante</p>
          <p className="mt-1">
            Ce rapport est fourni à titre informatif uniquement. Le CFO Masqué
            ne garantit pas la compétence des participants : les tests ne sont
            pas surveillés et ne permettent pas de valider l&apos;authenticité
            des réponses fournies. Le CFO Masqué ne pourra être tenu
            responsable si un participant obtient un résultat supérieur à ses
            compétences réelles (par exemple en utilisant une aide externe
            pendant le test).
          </p>
        </div>

        <div className="space-y-4">
          {rapport.resultats.map((r) => {
            const reco = recoParDomaine.get(r.domaine_id);
            const estExpert = r.niveau_atteint === "expert";
            return (
              <Card key={r.domaine_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <CardTitle className="text-lg">{r.domaine_nom}</CardTitle>
                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
                      {r.niveau_nom}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BarreNiveau niveau_atteint={r.niveau_atteint} />

                  {estExpert ? (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm font-medium text-primary">
                        Vous maîtrisez ce domaine au plus haut niveau testé — bravo !
                      </p>
                    </div>
                  ) : reco ? (
                    <FormationBlock reco={reco} />
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center gap-3 text-center">
          <Button asChild size="lg">
            <a
              href={`/api/test/${rapport.test_id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              {t.rapport.telecharger_pdf}
            </a>
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

type Reco = NonNullable<Awaited<ReturnType<typeof chargerRapport>>>["recommandations"][number];


function FormationBlock({ reco }: { reco: Reco }) {
  const aChaine = reco.prerequis_chaine.length > 0;
  return (
    <div className="space-y-3">
      {/* 1. Formation cible recommandée — en premier */}
      <div className="rounded-md border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Formation recommandée
            </p>
            <h3 className="mt-1 font-semibold">{reco.formation.titre}</h3>
            {reco.formation.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {reco.formation.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {reco.formation.duree ? (
                <span>{t.rapport.duree} : {reco.formation.duree}</span>
              ) : null}
              {reco.formation.prix ? (
                <span>{t.rapport.prix} : {reco.formation.prix}</span>
              ) : null}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a
              href={reco.formation.url_inscription}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.rapport.voir_formation}
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* 2. Chaîne des pré-requis — en dessous */}
      {aChaine ? (
        <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Pré-requis à compléter avant
          </p>
          <p className="mt-1 text-xs text-amber-700/80">
            Les formations ci-dessous sont recommandées dans cet ordre avant la
            formation cible.
          </p>
          <ol className="mt-3 space-y-3">
            {reco.prerequis_chaine.map((p, i) => (
              <li
                key={p.id}
                className="rounded-md border border-amber-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-900">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground">{p.titre}</h4>
                      {p.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {p.duree ? (
                          <span>{t.rapport.duree} : {p.duree}</span>
                        ) : null}
                        {p.prix ? (
                          <span>{t.rapport.prix} : {p.prix}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <a
                      href={p.url_inscription}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.rapport.voir_formation}
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
