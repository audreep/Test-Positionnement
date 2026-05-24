import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  chargerContexte,
  construireVueClient
} from "@/lib/adaptive/runner";
import type { EtatTest } from "@/lib/adaptive/engine";

interface Ctx { params: { id: string } }

/**
 * GET /api/test/[id]/state — retourne l'état courant du test à afficher au client.
 */
export async function GET(_request: Request, { params }: Ctx) {
  const supabase = createSupabaseAdminClient();

  const { data: test } = await supabase
    .from("tests")
    .select("id, statut, donnees_etat")
    .eq("id", params.id)
    .maybeSingle();
  if (!test) {
    return NextResponse.json({ error: "Test introuvable" }, { status: 404 });
  }

  const contexte = await chargerContexte(supabase);
  const vue = await construireVueClient(
    supabase,
    test.id,
    contexte,
    test.donnees_etat as EtatTest,
    test.statut as "en_cours" | "complete"
  );
  return NextResponse.json(vue);
}
