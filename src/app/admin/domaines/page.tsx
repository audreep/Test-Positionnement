import Link from "next/link";
import { Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

interface DomaineAvecCompte {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ordre: number;
  actif: boolean;
}

export default async function AdminDomainesPage() {
  const supabase = createSupabaseServerClient();

  const { data: domaines } = await supabase
    .from("domaines")
    .select("id, slug, nom, description, ordre, actif")
    .order("ordre", { ascending: true });

  const liste = (domaines ?? []) as DomaineAvecCompte[];

  // Compte questions et formations par domaine (en parallèle, queries simples).
  const ids = liste.map((d) => d.id);
  const [{ data: questionsBrutes }, { data: formationsBrutes }] = await Promise.all([
    supabase.from("questions").select("domaine_id, actif").in("domaine_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("formations").select("domaine_id, actif").in("domaine_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"])
  ]);
  const compterPar = (arr: Array<{ domaine_id: string; actif: boolean }> | null) => {
    const m = new Map<string, { actif: number; total: number }>();
    for (const r of arr ?? []) {
      const cur = m.get(r.domaine_id) ?? { actif: 0, total: 0 };
      cur.total++;
      if (r.actif) cur.actif++;
      m.set(r.domaine_id, cur);
    }
    return m;
  };
  const cptQ = compterPar(questionsBrutes as Array<{ domaine_id: string; actif: boolean }> | null);
  const cptF = compterPar(formationsBrutes as Array<{ domaine_id: string; actif: boolean }> | null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.domaines}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {liste.length} domaine(s) évalué(s) dans le test de positionnement.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/domaines/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>Note :</strong> ajouter un domaine ne crée AUCUNE question ni formation
        automatiquement. Le nouveau domaine apparaîtra dans l&apos;auto-évaluation et le rapport,
        mais aucune question ne sera posée jusqu&apos;à ce que vous en créiez. De même,
        le slug est PERMANENT après création.
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ordre</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Formations</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {liste.map((d) => {
              const q = cptQ.get(d.id) ?? { actif: 0, total: 0 };
              const f = cptF.get(d.id) ?? { actif: 0, total: 0 };
              return (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 align-top tabular-nums">{d.ordre}</td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{d.nom}</p>
                    {d.description ? (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {d.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.slug}</code>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {q.actif} actives / {q.total} total
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {f.actif} actives / {f.total} total
                  </td>
                  <td className="px-4 py-3 align-top">
                    {d.actif ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="outline">Inactif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/domaines/${d.id}`}>Modifier</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {liste.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Aucun domaine. Créez-en un avec le bouton ci-dessus.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
