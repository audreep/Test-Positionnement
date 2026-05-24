import Link from "next/link";
import { Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export default async function AdminQuestionsPage() {
  const supabase = createSupabaseServerClient();

  const { data: questions } = await supabase
    .from("questions")
    .select(`
      id, enonce, type, actif, ordre,
      domaine:domaines(nom),
      niveau:niveaux(nom, ordre)
    `)
    .order("domaine_id", { ascending: true })
    .order("ordre", { ascending: true })
    .limit(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.questions}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(questions ?? []).length} question(s) dans la banque.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/questions/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            {t.admin.ajouter}
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Énoncé</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(questions ?? []).map((q) => (
              <tr key={q.id} className="border-b last:border-0">
                <td className="px-4 py-3 align-top">
                  {/* @ts-expect-error Supabase join */}
                  {q.domaine?.nom}
                </td>
                <td className="px-4 py-3 align-top">
                  {/* @ts-expect-error Supabase join */}
                  {q.niveau?.nom}
                </td>
                <td className="px-4 py-3 align-top text-xs uppercase text-muted-foreground">
                  {q.type}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="line-clamp-2 max-w-xl">{q.enonce}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  {q.actif ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/questions/${q.id}`}>
                      {t.admin.modifier}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!questions || questions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Aucune question pour le moment. Ajoutez-en avec le bouton ci-dessus.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
