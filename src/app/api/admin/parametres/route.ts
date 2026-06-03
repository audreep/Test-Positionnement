import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chargerParametres, majDelaiReprise } from "@/lib/parametres";

/**
 * GET  /api/admin/parametres  → lit les paramètres applicatifs.
 * PUT  /api/admin/parametres  → met à jour le délai de reprise (en mois).
 *
 * La table `parametres` est protégée par RLS (aucun accès anon). On vérifie la
 * session admin via le client serveur, puis on lit/écrit avec le client
 * service_role (qui bypasse RLS).
 */
export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const params = await chargerParametres(admin);
  return NextResponse.json(params);
}

export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const valeur = body?.delai_reprise_mois;

  if (
    typeof valeur !== "number" ||
    !Number.isInteger(valeur) ||
    valeur < 0 ||
    valeur > 120
  ) {
    return NextResponse.json(
      { error: "Le délai doit être un entier entre 0 et 120 mois." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  await majDelaiReprise(admin, valeur);
  return NextResponse.json({ delai_reprise_mois: valeur });
}
