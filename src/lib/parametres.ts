import type { SupabaseClient } from "@supabase/supabase-js";

/** Délai par défaut (en mois) avant qu'un même courriel puisse repasser le test. */
export const DELAI_REPRISE_DEFAUT_MOIS = 3;

export interface ConfigApp {
  delai_reprise_mois: number;
}

/**
 * Lit les paramètres applicatifs (table singleton `parametres`). Retombe sur
 * les valeurs par défaut si la table ou la ligne est absente.
 * À appeler avec un client service_role (admin) — la table n'est pas exposée
 * au rôle anon.
 */
export async function chargerParametres(
  supabase: SupabaseClient
): Promise<ConfigApp> {
  const { data } = await supabase
    .from("parametres")
    .select("delai_reprise_mois")
    .eq("id", 1)
    .maybeSingle();

  const delai =
    typeof data?.delai_reprise_mois === "number"
      ? data.delai_reprise_mois
      : DELAI_REPRISE_DEFAUT_MOIS;

  return { delai_reprise_mois: delai };
}

/** Met à jour le délai de reprise (en mois). */
export async function majDelaiReprise(
  supabase: SupabaseClient,
  mois: number
): Promise<void> {
  await supabase.from("parametres").upsert(
    {
      id: 1,
      delai_reprise_mois: mois,
      mise_a_jour_le: new Date().toISOString()
    },
    { onConflict: "id" }
  );
}

/**
 * Date à partir de laquelle une reprise est permise = date de complétion du
 * dernier test + le délai (en mois). Si delai = 0, la reprise est immédiate.
 */
export function dateRepriseEligible(dateFin: string, delaiMois: number): Date {
  const d = new Date(dateFin);
  d.setMonth(d.getMonth() + delaiMois);
  return d;
}
