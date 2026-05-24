import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { questionFormSchema } from "@/lib/validation";

interface Ctx { params: { id: string } }

/**
 * PATCH /api/admin/questions/[id] — modifier une question.
 * DELETE /api/admin/questions/[id] — désactiver une question (soft delete).
 *
 * Note : on désactive plutôt que de supprimer pour préserver l'intégrité
 * référentielle avec la table reponses.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = questionFormSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("questions")
    .update(parsed.data)
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { error } = await supabase
    .from("questions")
    .update({ actif: false })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
