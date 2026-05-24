import Link from "next/link";
import { Download } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export default async function AdminClientsPage() {
  const supabase = createSupabaseServerClient();

  // Pour Phase 1, on récupère les clients + leur dernier test.
  const { data: clients } = await supabase
    .from("clients")
    .select(`
      id, prenom, nom, courriel, source_acquisition, consentement_marketing,
      date_consentement, cree_le,
      tests:tests(id, statut, score_global, date_fin)
    `)
    .order("cree_le", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.clients}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(clients ?? []).length} client(s) au total.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/export-csv" download="cfo-masque-resultats.csv">
            <Download className="mr-2 h-4 w-4" />
            {t.admin.exporter_csv}
          </a>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Statut du test</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Créé le</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(clients ?? []).map((c) => {
              const tests = (c.tests as unknown as { statut: string; score_global: number | null }[]) ?? [];
              const dernierTest = tests[0];
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {c.prenom} {c.nom}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.courriel}</td>
                  <td className="px-4 py-3 capitalize">{c.source_acquisition}</td>
                  <td className="px-4 py-3">
                    {dernierTest ? (
                      <Badge
                        variant={dernierTest.statut === "complete" ? "success" : "outline"}
                      >
                        {dernierTest.statut}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {dernierTest?.score_global != null ? `${dernierTest.score_global} %` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateFr(c.cree_le)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/clients/${c.id}`}>Voir</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {(!clients || clients.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Aucun client n&apos;a encore passé le test.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
