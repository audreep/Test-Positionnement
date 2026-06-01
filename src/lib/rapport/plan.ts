import type { Formation } from "@/lib/supabase/types";

interface RecommandationLike {
  domaine_nom: string;
  formation: Formation;
  /** Pré-requis à suivre AVANT la formation cible, déjà dans l'ordre logique. */
  prerequis_chaine: Formation[];
}

export interface EtapePlan {
  formation: Formation;
  /** Domaine pour lequel cette formation est recommandée (premier rencontré). */
  domaine_nom: string;
  /** true = formation cible d'un domaine ; false = pré-requis. */
  est_cible: boolean;
}

/**
 * Consolide toutes les recommandations en UN plan de formation global, ordonné
 * logiquement : pour chaque domaine on place d'abord ses pré-requis (déjà
 * ordonnés du plus en amont au plus immédiat) puis la formation cible. Les
 * formations partagées entre domaines ne sont listées qu'une fois, à leur
 * première occurrence — ce qui garantit qu'un pré-requis apparaît toujours
 * avant la formation qui en dépend.
 */
export function construirePlanFormation(
  recommandations: RecommandationLike[]
): EtapePlan[] {
  const vus = new Set<string>();
  const plan: EtapePlan[] = [];

  for (const reco of recommandations) {
    for (const prereq of reco.prerequis_chaine) {
      if (!vus.has(prereq.id)) {
        vus.add(prereq.id);
        plan.push({ formation: prereq, domaine_nom: reco.domaine_nom, est_cible: false });
      }
    }
    if (!vus.has(reco.formation.id)) {
      vus.add(reco.formation.id);
      plan.push({ formation: reco.formation, domaine_nom: reco.domaine_nom, est_cible: true });
    }
  }

  return plan;
}
