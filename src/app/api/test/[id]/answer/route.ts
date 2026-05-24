import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reponseSchema } from "@/lib/validation";
import { chargerContexte, soumettreReponse } from "@/lib/adaptive/runner";

interface Ctx { params: { id: string } }

/**
 * POST /api/test/[id]/answer
 * Enregistre la réponse à la question courante et avance l'état du test.
 */
export async function POST(request: Request, { params }: Ctx) {
  const body = await request.json().catch(() => null);
  const parsed = reponseSchema.safeParse({ ...body, test_id: params.id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const contexte = await chargerContexte(supabase);
  try {
    const { vue } = await soumettreReponse(
      supabase,
      params.id,
      parsed.data.question_id,
      parsed.data.reponse_donnee ?? null,
      parsed.data.temps_passe_ms,
      contexte
    );
    return NextResponse.json(vue);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
