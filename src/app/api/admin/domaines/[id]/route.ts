import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { domaineUpdateSchema } from "@/lib/validation";

interface Ctx { params: { id: string } }

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * PATCH /api/admin/domaines/[id] — modifier nom, description, ordre, actif.
 * Le SLUG n'est PAS modifiable (référencé dans i18n + chaînes de pré-requis).
 *
 * DELETE /api/admin/domaines/[id] — supprime UNIQUEMENT si aucune question
 * ni formation n'est encore rattachée (hard guard). Pour archiver, utiliser
 * PATCH avec actif=false.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = domaineUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("domaines")
    .update(parsed.data)
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Garde-fou : refuser la suppression si des questions ou formations existent.
  // Ces données seraient orphelines (le foreign key sur questions.domaine_id
  // bloquerait de toute façon, mais on retourne un message clair).
  const [{ count: nbQuestions }, { count: nbFormations }] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("domaine_id", params.id),
    supabase.from("formations").select("id", { count: "exact", head: true }).eq("domaine_id", params.id)
  ]);

  if ((nbQuestions ?? 0) > 0 || (nbFormations ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "Suppression refusée : ce domaine contient encore " +
          (nbQuestions ?? 0) +
          " question(s) et " +
          (nbFormations ?? 0) +
          " formation(s). Désactivez-les ou changez-les de domaine, ou utilisez « Désactiver » au lieu de supprimer."
      },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("domaines").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
