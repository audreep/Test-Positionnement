import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { intakeSchema } from "@/lib/validation";
import { chargerContexte, demarrerOuReprendreTest } from "@/lib/adaptive/runner";
import type { AutoEvaluation } from "@/lib/adaptive/engine";

/**
 * POST /api/test/start
 * Cree (ou retrouve) un client, demarre (ou reprend) un test, retourne son ID.
 *
 * Le payload inclut un champ `auto_evaluations` : un dictionnaire
 * { domaine_slug: "novice" | "a_laise" | "expert" | "skip" }.
 * On verifie ici que tous les domaines actifs sont couverts.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const contexte = await chargerContexte(supabase);

  // Verifie que chaque domaine actif a son auto-evaluation.
  const auto_par_slug = parsed.data.auto_evaluations as Record<string, AutoEvaluation>;
  const manquants = contexte.domaines.filter((d) => !auto_par_slug[d.slug]);
  if (manquants.length > 0) {
    return NextResponse.json(
      {
        error: "Auto-evaluation manquante pour : "
          + manquants.map((d) => d.nom).join(", ")
      },
      { status: 400 }
    );
  }
  // Reindexe par domaine.id (les domaines arrivent en slug dans le payload).
  const auto_par_id: Record<string, AutoEvaluation> = {};
  for (const d of contexte.domaines) {
    auto_par_id[d.id] = auto_par_slug[d.slug];
  }

  // Upsert client par courriel normalise.
  const courriel = parsed.data.courriel.trim().toLowerCase();
  const { data: existant } = await supabase
    .from("clients")
    .select("id")
    .eq("courriel_normalise", courriel)
    .maybeSingle();

  let client_id: string;
  if (existant) {
    client_id = existant.id;
    await supabase
      .from("clients")
      .update({
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        source_acquisition: parsed.data.source_acquisition,
        consentement_marketing: parsed.data.consentement_marketing,
        date_consentement: new Date().toISOString()
      })
      .eq("id", client_id);
  } else {
    const { data: cree, error } = await supabase
      .from("clients")
      .insert({
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        courriel: parsed.data.courriel,
        source_acquisition: parsed.data.source_acquisition,
        consentement_marketing: parsed.data.consentement_marketing
      })
      .select("id")
      .single();
    if (error || !cree) {
      return NextResponse.json(
        { error: error?.message ?? "Creation client echouee" },
        { status: 500 }
      );
    }
    client_id = cree.id;
  }

  try {
    const { test_id, statut } = await demarrerOuReprendreTest(
      supabase, client_id, auto_par_id, contexte
    );
    cookies().set("cfo_test_" + test_id, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/test",
      maxAge: 60 * 60 * 24
    });
    return NextResponse.json({ test_id, statut });
  } catch (err) {
    if ((err as Error & { code?: string }).code === "DEJA_COMPLETE") {
      return NextResponse.json(
        { error: "Vous avez deja complete ce test. Communiquez avec nous pour le reinitialiser." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
