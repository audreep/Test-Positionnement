import type { Formation, Niveau, NiveauSlug } from "@/lib/supabase/types";
import type { ResultatDomaine } from "./engine";
import { ORDRE_NIVEAUX } from "./engine";

/**
 * Score global = pourcentage total de bonnes réponses sur l'ensemble du test.
 * Les domaines "passés" (non évalués) ne comptent pas dans le calcul.
 */
export function scoreGlobal(resultats: ResultatDomaine[]): number {
  const valides = resultats.filter((r) => !r.passe);
  const total_reponses = valides.reduce((acc, r) => acc + r.nb_reponses, 0);
  const total_correctes = valides.reduce((acc, r) => acc + r.nb_correctes, 0);
  if (total_reponses === 0) return 0;
  return Math.round((total_correctes / total_reponses) * 100);
}

/**
 * Détermine si un domaine mérite une recommandation de formation.
 *
 * Règle (assouplie depuis la Phase 1) : on recommande une formation pour TOUT
 * domaine où le client n'a pas atteint le niveau Expert. Cela inclut :
 *   • Domaines "passés" (skip) → recommandation au niveau Débutant
 *   • Domaines avec niveau atteint = null/Débutant/Intermédiaire/Avancé
 * Seuls les domaines où le client est Expert (sommet atteint) n'ont pas de
 * recommandation.
 *
 * (Nom historique conservé : ne s'agit plus strictement d'une "lacune" mais
 * d'une opportunité de progression.)
 */
export function estLacune(resultat: ResultatDomaine): boolean {
  if (resultat.passe) return true;
  if (!resultat.niveau_atteint) return true;
  const idx_atteint = ORDRE_NIVEAUX.indexOf(resultat.niveau_atteint);
  const idx_expert = ORDRE_NIVEAUX.indexOf("expert");
  return idx_atteint < idx_expert;
}

/**
 * Pour un résultat de domaine donné, choisit la meilleure formation à
 * recommander parmi la liste fournie.
 *
 * Règle : on cherche une formation active du même domaine, au niveau juste
 * au-dessus du niveau atteint (Débutant → formation Intermédiaire, etc.).
 *
 * Fallback : si aucune formation n'existe au niveau cible, on remonte d'un
 * cran (cible+1, cible+2, ..., Expert) jusqu'à en trouver une. C'est plus
 * cohérent que de retomber sur la formation la plus basse — un client qui
 * a atteint l'Intermédiaire ne doit jamais se voir suggérer une formation
 * Débutant. Retourne null si vraiment aucune formation pertinente n'existe
 * (i.e. le client est déjà au sommet du catalogue dans ce domaine).
 */
export function trouverRecommandation(
  resultat: ResultatDomaine,
  formations: Formation[],
  niveaux: Niveau[]
): Formation | null {
  const formationsDomaine = formations
    .filter((f) => f.actif && f.domaine_id === resultat.domaine_id)
    .map((f) => {
      const n = niveaux.find((x) => x.id === f.niveau_id);
      return { formation: f, niveau_slug: n?.slug ?? null, ordre: n?.ordre ?? 99 };
    });
  if (formationsDomaine.length === 0) return null;

  const slug_atteint: NiveauSlug | null = resultat.niveau_atteint;
  let idx_cible: number;
  if (slug_atteint === null) {
    idx_cible = 0; // Débutant
  } else {
    const idx = ORDRE_NIVEAUX.indexOf(slug_atteint);
    idx_cible = Math.min(idx + 1, ORDRE_NIVEAUX.length - 1);
  }

  // Cherche au niveau cible, puis remonte jusqu'à Expert.
  for (let i = idx_cible; i < ORDRE_NIVEAUX.length; i++) {
    const niveau_cible = ORDRE_NIVEAUX[i];
    const trouve = formationsDomaine.find((x) => x.niveau_slug === niveau_cible);
    if (trouve) return trouve.formation;
  }

  return null;
}

/**
 * Construit la liste ordonnée des pré-requis à compléter avant la formation
 * cible. La résolution est transitive (un pré-requis de pré-requis est inclus
 * en amont) et omet ceux que le client maîtrise déjà.
 *
 * Critère "maîtrisé" : le niveau atteint par le client dans le domaine du
 * pré-requis est ≥ au niveau de cette formation pré-requise. Cela couvre
 * naturellement le cas strict (niveaux égaux) ET le cas où le client a
 * dépassé ce niveau dans le domaine concerné (cross-domaine notamment).
 *
 * Retour : tableau des Formation, du pré-requis le plus en amont au plus
 * immédiat (donc dans l'ordre où le client devrait les suivre). La formation
 * cible elle-même n'est PAS incluse.
 */
export function chainePrerequis(
  cible: Formation,
  formations: Formation[],
  niveaux: Niveau[],
  niveauxParDomaine: Map<string, NiveauSlug | null>
): Formation[] {
  const indexParId = new Map(formations.map((f) => [f.id, f]));
  const visites = new Set<string>();
  const chaine: Formation[] = [];

  function niveauSlugDe(f: Formation): NiveauSlug | null {
    return niveaux.find((n) => n.id === f.niveau_id)?.slug ?? null;
  }

  function dejaMaitrise(f: Formation): boolean {
    const niveauF = niveauSlugDe(f);
    if (!niveauF) return false;
    const niveauUser = niveauxParDomaine.get(f.domaine_id) ?? null;
    if (!niveauUser) return false;
    return ORDRE_NIVEAUX.indexOf(niveauUser) >= ORDRE_NIVEAUX.indexOf(niveauF);
  }

  function marcher(f: Formation) {
    if (visites.has(f.id)) return;
    visites.add(f.id);
    // Parcours post-ordre : on traite les pré-requis AVANT le nœud courant
    // afin d'obtenir un tri topologique (dépendances d'abord).
    for (const id of f.prerequis_ids ?? []) {
      const p = indexParId.get(id);
      if (p && p.actif) marcher(p);
    }
    if (f.id === cible.id) return;  // on n'inclut pas la cible
    if (dejaMaitrise(f)) return;    // déjà maîtrisé → omis
    chaine.push(f);
  }

  marcher(cible);
  return chaine;
}

export interface Recommandation {
  domaine_id: string;
  formation: Formation;
  /**
   * Liste ordonnée des formations pré-requises à suivre AVANT la formation
   * cible. Exclut les pré-requis que le client a déjà maîtrisés (niveau
   * atteint dans le domaine du pré-requis ≥ niveau de cette formation).
   * Vide si aucun pré-requis ou si tous sont déjà maîtrisés.
   */
  prerequis_chaine: Formation[];
}

/**
 * Construit la liste finale des recommandations pour un test : une par
 * domaine où le client peut encore progresser (< Expert).
 */
export function construireRecommandations(
  resultats: ResultatDomaine[],
  formations: Formation[],
  niveaux: Niveau[]
): Recommandation[] {
  // Index niveau_atteint par domaine_id, pour la résolution des pré-requis
  // (potentiellement cross-domaine). Un domaine "passé" (skip) est traité
  // comme niveau Débutant attribué d'office.
  const niveauxParDomaine = new Map<string, NiveauSlug | null>(
    resultats.map((r) => [r.domaine_id, r.passe ? "debutant" : r.niveau_atteint])
  );

  const recos: Recommandation[] = [];
  for (const r of resultats) {
    if (!estLacune(r)) continue;
    const f = trouverRecommandation(r, formations, niveaux);
    if (!f) continue;
    const chaine = chainePrerequis(f, formations, niveaux, niveauxParDomaine);
    recos.push({
      domaine_id: r.domaine_id,
      formation: f,
      prerequis_chaine: chaine
    });
  }
  return recos;
}
