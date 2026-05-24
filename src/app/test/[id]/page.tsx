import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  chargerContexte,
  construireVueClient,
  reparerEtatBloque
} from "@/lib/adaptive/runner";
import type { EtatTest } from "@/lib/adaptive/engine";
import { TestRunner } from "@/components/test/test-runner";

interface Props { params: { id: string } }

/**
 * Écran principal du parcours client : affiche la question courante et gère
 * les transitions (côté serveur initial + composant client interactif).
 *
 * Auto-réparation : si l'état stocké en base est "bloqué" (pas de question
 * en cours, mais test pas terminé), on tente de le débloquer en cherchant
 * la prochaine question disponible ou en finalisant le test.
 */
export default async function TestSessionPage({ params }: Props) {
  const supabase = createSupabaseAdminClient();
  const { data: test } = await supabase
    .from("tests")
    .select("id, statut, donnees_etat")
    .eq("id", params.id)
    .maybeSingle();
  if (!test) {
    redirect("/test");
  }

  if (test.statut === "complete") {
    redirect("/test/" + params.id + "/rapport");
  }

  const contexte = await chargerContexte(supabase);
  let etatCourant = test.donnees_etat as EtatTest;
  let statut = test.statut as "en_cours" | "complete";

  // Tentative d'auto-réparation si l'état est bloqué.
  if (
    statut === "en_cours" &&
    !etatCourant.question_courante_id &&
    etatCourant.domaine_actuel_idx < contexte.domaines.length
  ) {
    const { etat: repare, statut: nouveauStatut } = await reparerEtatBloque(
      supabase, test.id, contexte, etatCourant
    );
    etatCourant = repare;
    statut = nouveauStatut;
    if (statut === "complete") {
      redirect("/test/" + params.id + "/rapport");
    }
  }

  const vueInitiale = await construireVueClient(
    supabase, test.id, contexte, etatCourant, statut
  );

  return <TestRunner vueInitiale={vueInitiale} totalDomaines={contexte.domaines.length} />;
}
