import Link from "next/link";
import { Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export default async function AdminFormationsPage() {
  const supabase = createSupabaseServerClient();
  const { data: formations } = await supabase
    .from("formations")
    .select(`id, titre, duree, prix, url_inscription, actif,
             domaine:domaines(nom), niveau:niveaux(nom, ordre)`)
    .order("titre");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.formations}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(formations ?? []).length} formation(s) au catalogue.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/formations/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            {t.admin.ajouter}
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(formations ?? []).map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <a href={f.url_inscription} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {f.titre}
                  </a>
                </td>
                {/* @ts-expect-error Supabase join */}
                <td className="px-4 py-3">{f.domaine?.nom}</td>
                {/* @ts-expect-error Supabase join */}
                <td className="px-4 py-3">{f.niveau?.nom}</td>
                <td className="px-4 py-3">{f.duree ?? "—"}</td>
                <td className="px-4 py-3">{f.prix ?? "—"}</td>
                <td className="px-4 py-3">
                  {f.actif ? <Badge variant="success">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/formations/${f.id}`}>
                      {t.admin.modifier}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {(!formations || formations.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune formation pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
