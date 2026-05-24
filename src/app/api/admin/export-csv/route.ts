import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/export-csv
 * Exporte une vue à plat de tous les tests complétés, avec un score par domaine.
 * Format CSV (UTF-8, séparateur virgule, valeurs quotées si besoin).
 */
export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // On récupère tous les tests avec leur client et scores par domaine.
  const { data, error } = await supabase
    .from("tests")
    .select(`
      id, statut, score_global, date_debut, date_fin,
      client:clients(prenom, nom, courriel, source_acquisition, consentement_marketing),
      scores:scores_par_domaine(
        pourcentage, nb_reponses, nb_correctes, passe,
        domaine:domaines(nom, slug),
        niveau_atteint:niveaux(nom)
      )
    `)
    .order("date_debut", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Construction du CSV.
  const entetes = [
    "test_id",
    "statut",
    "score_global",
    "date_debut",
    "date_fin",
    "client_prenom",
    "client_nom",
    "client_courriel",
    "source_acquisition",
    "consentement_marketing",
    "domaine",
    "niveau_atteint",
    "passe",
    "pourcentage_domaine",
    "nb_reponses",
    "nb_correctes"
  ];

  const lignes: string[] = [entetes.join(",")];

  for (const test of data ?? []) {
    const client = test.client as unknown as {
      prenom: string; nom: string; courriel: string;
      source_acquisition: string; consentement_marketing: boolean;
    } | null;
    const scores = (test.scores as unknown as Array<{
      pourcentage: number; nb_reponses: number; nb_correctes: number; passe: boolean;
      domaine: { nom: string; slug: string };
      niveau_atteint: { nom: string } | null;
    }>) ?? [];

    if (scores.length === 0) {
      lignes.push(toRow([
        test.id, test.statut, test.score_global, test.date_debut, test.date_fin,
        client?.prenom, client?.nom, client?.courriel,
        client?.source_acquisition, String(client?.consentement_marketing ?? ""),
        "", "", "", "", "", ""
      ]));
      continue;
    }

    for (const s of scores) {
      lignes.push(toRow([
        test.id, test.statut, test.score_global, test.date_debut, test.date_fin,
        client?.prenom, client?.nom, client?.courriel,
        client?.source_acquisition, String(client?.consentement_marketing ?? ""),
        s.domaine?.nom,
        s.niveau_atteint?.nom ?? "Non évalué",
        String(s.passe),
        String(s.pourcentage),
        String(s.nb_reponses),
        String(s.nb_correctes)
      ]));
    }
  }

  const csv = "﻿" + lignes.join("\n"); // BOM UTF-8 pour Excel
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cfo-masque-resultats-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

function toRow(values: Array<unknown>): string {
  return values
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(",");
}
