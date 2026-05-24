import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClientActions } from "@/components/admin/client-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/utils";

interface Props { params: { id: string } }

export default async function ClientDetailPage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!client) notFound();

  const { data: tests } = await supabase
    .from("tests")
    .select(`
      id, statut, score_global, date_debut, date_fin,
      scores:scores_par_domaine(
        pourcentage, nb_reponses, nb_correctes, passe,
        domaine:domaines(nom),
        niveau_atteint:niveaux(nom)
      )
    `)
    .eq("client_id", client.id)
    .order("date_debut", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {client.prenom} {client.nom}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{client.courriel}</p>
        </div>
        <ClientActions clientId={client.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Source d'acquisition" valeur={client.source_acquisition} />
          <Info label="Consentement marketing" valeur={client.consentement_marketing ? "Oui" : "Non"} />
          <Info label="Date du consentement" valeur={formatDateFr(client.date_consentement)} />
          <Info label="Compte créé le" valeur={formatDateFr(client.cree_le)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tests ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun test pour ce client.</p>
          ) : null}
          {(tests ?? []).map((test) => (
            <div key={test.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={test.statut === "complete" ? "success" : "outline"}>
                    {test.statut}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Démarré le {formatDateFr(test.date_debut)}
                  </span>
                </div>
                <div className="text-sm">
                  {test.score_global != null ? (
                    <span className="font-medium">Score : {test.score_global} %</span>
                  ) : (
                    <span className="text-muted-foreground">Score : —</span>
                  )}
                </div>
              </div>

              {test.scores && Array.isArray(test.scores) && test.scores.length > 0 ? (
                <table className="mt-3 w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2 text-left">Domaine</th>
                      <th className="py-2 text-left">Niveau atteint</th>
                      <th className="py-2 text-left">% bonnes réponses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(test.scores as unknown as Array<{
                      domaine: { nom: string };
                      niveau_atteint: { nom: string } | null;
                      pourcentage: number;
                      passe: boolean;
                    }>).map((s, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2">{s.domaine?.nom}</td>
                        <td className="py-2">
                          {s.passe
                            ? "Non évalué (passé)"
                            : s.niveau_atteint?.nom ?? "Non atteint"}
                        </td>
                        <td className="py-2">{s.pourcentage} %</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 capitalize">{valeur}</dd>
    </div>
  );
}
