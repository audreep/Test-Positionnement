import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface Ctx { params: { id: string } }

/**
 * POST /api/admin/clients/[id]/reset
 * Supprime tous les tests, réponses et scores du client tout en conservant
 * son profil et son consentement. Le client pourra repasser le test.
 */
export async function POST(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // La cascade sur tests supprime automatiquement les réponses et scores.
  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("client_id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
