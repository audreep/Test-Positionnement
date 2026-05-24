import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

/**
 * Tableau de bord admin : statistiques globales.
 */
export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  const [
    { count: nb_clients },
    { count: nb_tests_complets },
    { count: nb_tests_total },
    { data: scores }
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("tests")
      .select("id", { count: "exact", head: true })
      .eq("statut", "complete"),
    supabase.from("tests").select("id", { count: "exact", head: true }),
    supabase
      .from("tests")
      .select("score_global")
      .eq("statut", "complete")
      .not("score_global", "is", null)
  ]);

  const score_moyen = scores && scores.length > 0
    ? Math.round(
        scores.reduce((acc, s) => acc + (s.score_global ?? 0), 0) /
          scores.length
      )
    : 0;

  const taux_completion =
    nb_tests_total && nb_tests_total > 0
      ? Math.round(((nb_tests_complets ?? 0) / nb_tests_total) * 100)
      : 0;

  const tuiles = [
    { titre: t.admin.stats_nb_clients, valeur: String(nb_clients ?? 0) },
    {
      titre: t.admin.stats_nb_tests_complets,
      valeur: String(nb_tests_complets ?? 0)
    },
    { titre: t.admin.stats_score_moyen, valeur: `${score_moyen} %` },
    { titre: t.admin.stats_taux_completion, valeur: `${taux_completion} %` }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.admin.tableau_de_bord}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble du test de positionnement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tuiles.map((tuile) => (
          <Card key={tuile.titre}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tuile.titre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{tuile.valeur}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
