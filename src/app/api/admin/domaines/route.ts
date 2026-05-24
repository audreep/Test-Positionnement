import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { domaineCreateSchema } from "@/lib/validation";

// Route admin : runtime + dynamique (jamais pré-rendue, dépend de la session).
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * POST /api/admin/domaines
 * Crée un nouveau domaine évalué. Le slug devient une clé permanente
 * (référencée dans i18n + chaînes de pré-requis cross-domaine) : il ne
 * pourra plus être modifié après création.
 */
export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = domaineCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Vérifie l'unicité du slug avant insertion.
  const { data: existant } = await supabase
    .from("domaines")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();
  if (existant) {
    return NextResponse.json(
      { error: "Un domaine avec ce slug existe déjà." },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("domaines")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
