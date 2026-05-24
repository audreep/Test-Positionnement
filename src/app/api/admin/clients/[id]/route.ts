import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Ctx { params: { id: string } }

/**
 * DELETE /api/admin/clients/[id]
 * Conformité Loi 25 : supprime le client et toutes ses données dérivées
 * (cascade en base : tests, réponses, scores).
 */
export async function DELETE(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
