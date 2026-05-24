import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Cette route nécessite une session admin et lit Supabase au runtime.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
  action: z.enum(["desactiver", "activer"])
});

/**
 * POST /api/admin/questions/bulk
 * Actions en masse sur des questions :
 *   • desactiver : set actif=false (soft delete — préserve l'intégrité avec reponses)
 *   • activer    : set actif=true
 */
export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, action } = parsed.data;
  const nouveau_actif = action === "activer";

  const { error, count } = await supabase
    .from("questions")
    .update({ actif: nouveau_actif }, { count: "exact" })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: count ?? 0 });
}
