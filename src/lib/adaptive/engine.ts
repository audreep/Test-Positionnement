/**
 * =============================================================================
 * Moteur adaptatif — auto-evaluation + progression bidirectionnelle.
 *
 * Flux client :
 *   1) Apres l'intake, le client auto-evalue son niveau pour chacun des 6
 *      domaines via une des 4 valeurs : "novice", "a_laise", "expert",
 *      ou "skip" (= "Je ne connais pas, passer").
 *   2) Pour chaque domaine non skipped, on commence par 3 questions au niveau
 *      mappe a l'auto-eval :
 *        novice    -> Debutant
 *        a_laise   -> Intermediaire
 *        expert    -> Avance      (l'Expert reel n'est atteint qu'en cas
 *                                  de promotion suite a une reussite)
 *   3) Apres chaque bloc de 3 questions :
 *        - >= 2/3 reussies : on enregistre ce niveau comme "max_reussi" et
 *          on monte d'un cran (sauf si on a deja echoue au niveau juste
 *          au-dessus -> on finalise le domaine).
 *        - < 2/3 reussies : on enregistre ce niveau comme "min_echoue" et
 *          on descend d'un cran (sauf si on a deja reussi au niveau juste
 *          en-dessous -> on finalise le domaine au niveau max_reussi).
 *   4) Cas limites :
 *        - Echec au niveau Debutant : niveau atteint = aucun.
 *        - Reussite au niveau Expert : niveau atteint = Expert.
 *        - Domaine "skip" : passe = true, aucun niveau attribue.
 *   5) Aucun retour en arriere n'est permis dans l'UI.
 * ==========================================================================
 */

import type {
  Domaine,
  Niveau,
  NiveauSlug,
  Question,
  QuestionType
} from "@/lib/supabase/types";

export const ORDRE_NIVEAUX: NiveauSlug[] = [
  "debutant",
  "intermediaire",
  "avance",
  "expert"
];

export const SEUIL_REUSSITE = 2; // sur 3
export const QUESTIONS_PAR_NIVEAU = 3;

export type AutoEvaluation =
  | "novice"        // -> Débutant comme niveau de depart pour le test adaptatif
  | "a_laise"       // -> Intermediaire comme niveau de depart
  | "expert"        // -> Avance comme niveau de depart (l'Expert reel s'obtient par promotion)
  | "skip"          // "Je ne connais pas" -> AUCUNE question posee, niveau Debutant attribue d'office
  | "non_pertinent";// "Ce domaine ne m'interesse pas" -> domaine EXCLU du test et du rapport

/**
 * Mappe une auto-evaluation a un niveau de depart de la banque de questions.
 * Retourne null pour "skip" et "non_pertinent" (aucune question n'est posee dans ces cas).
 */
export function niveauDeDepart(auto: AutoEvaluation): NiveauSlug | null {
  switch (auto) {
    case "novice":         return "debutant";
    case "a_laise":        return "intermediaire";
    case "expert":         return "avance";
    case "skip":           return null;
    case "non_pertinent":  return null;
  }
}

// -----------------------------------------------------------------------------
// Etat serialise d'un test (stocke dans tests.donnees_etat)
// -----------------------------------------------------------------------------
export interface ResultatDomaine {
  domaine_id: string;
  niveau_atteint: NiveauSlug | null;
  passe: boolean;
  pourcentage: number;
  nb_reponses: number;
  nb_correctes: number;
}

export interface EtatTest {
  /** index dans la liste des domaines triés par 'ordre'. */
  domaine_actuel_idx: number;
  /** slug du niveau actuellement testé dans le domaine courant. */
  niveau_actuel: NiveauSlug;
  /** Questions déjà répondues dans le niveau courant (max 3). */
  reponses_niveau_courant: Array<{ question_id: string; correct: boolean }>;
  /** Toutes les questions tirées depuis le début du test (anti-répétition). */
  questions_id_deja_tirees: string[];
  /** Résultats finalisés par domaine. */
  resultats_domaines: ResultatDomaine[];
  /** L'ID de la question présentement affichée, s'il y en a une. */
  question_courante_id: string | null;
  /** Auto-évaluations saisies à l'intake, keyée par domaine_id. */
  auto_evaluations: Record<string, AutoEvaluation>;
  /** Pour le domaine courant : niveau le plus haut où on a déjà réussi. */
  niveau_max_reussi: NiveauSlug | null;
  /** Pour le domaine courant : niveau le plus bas où on a déjà échoué. */
  niveau_min_echoue: NiveauSlug | null;
}

export function etatInitial(
  auto_evaluations: Record<string, AutoEvaluation> = {}
): EtatTest {
  return {
    domaine_actuel_idx: 0,
    niveau_actuel: "debutant",
    reponses_niveau_courant: [],
    questions_id_deja_tirees: [],
    resultats_domaines: [],
    question_courante_id: null,
    auto_evaluations,
    niveau_max_reussi: null,
    niveau_min_echoue: null
  };
}

// -----------------------------------------------------------------------------
// Tirage aléatoire d'une question
// -----------------------------------------------------------------------------
export function piocheQuestion(
  banque: Question[],
  questions_deja_tirees: string[],
  prng: () => number = Math.random
): Question | null {
  if (banque.length === 0) return null;
  const dispo = banque.filter((q) => !questions_deja_tirees.includes(q.id));
  const pool = dispo.length > 0 ? dispo : banque;
  const idx = Math.floor(prng() * pool.length);
  return pool[idx];
}

// -----------------------------------------------------------------------------
// Validation d'une réponse
// -----------------------------------------------------------------------------
export function reponseEstCorrecte(
  question: Pick<Question, "type" | "bonne_reponse" | "regex_acceptees">,
  reponse: string | null | undefined
): boolean {
  if (reponse == null) return false;
  const r = reponse.trim();
  if (r.length === 0) return false;

  switch (question.type as QuestionType) {
    case "choix_multiple":
    case "cas_pratique":
    case "vrai_faux":
      return r.toLowerCase() === (question.bonne_reponse ?? "").toLowerCase();

    case "formule": {
      const candidat = r.replace(/\s+/g, "");
      const regexes = question.regex_acceptees ?? [];
      if (regexes.length > 0) {
        return regexes.some((src) => {
          try { return new RegExp(src, "i").test(candidat); }
          catch { return false; }
        });
      }
      const cible = (question.bonne_reponse ?? "")
        .trim().replace(/\s+/g, "").toLowerCase();
      return candidat.toLowerCase() === cible;
    }

    default: return false;
  }
}

// -----------------------------------------------------------------------------
// Helpers de niveau adjacent
// -----------------------------------------------------------------------------
function niveauAuDessus(n: NiveauSlug): NiveauSlug | null {
  const idx = ORDRE_NIVEAUX.indexOf(n);
  if (idx < 0 || idx >= ORDRE_NIVEAUX.length - 1) return null;
  return ORDRE_NIVEAUX[idx + 1];
}
function niveauEnDessous(n: NiveauSlug): NiveauSlug | null {
  const idx = ORDRE_NIVEAUX.indexOf(n);
  if (idx <= 0) return null;
  return ORDRE_NIVEAUX[idx - 1];
}

// -----------------------------------------------------------------------------
// Décision après 3 réponses (bidirectionnel)
// -----------------------------------------------------------------------------
export type ProchaineEtape =
  | { type: "poser_question" }
  | { type: "monter_niveau"; depuis: NiveauSlug; vers: NiveauSlug }
  | { type: "descendre_niveau"; depuis: NiveauSlug; vers: NiveauSlug }
  | { type: "finaliser_domaine"; raison: "convergence" | "plancher" | "plafond" };

/**
 * À appeler après chaque réponse enregistrée dans `reponses_niveau_courant`.
 * Retourne la prochaine action à effectuer.
 */
export function decisionApresReponse(etat: EtatTest): ProchaineEtape {
  const reponses = etat.reponses_niveau_courant;

  // 1) Pas encore 3 réponses → continuer le niveau.
  if (reponses.length < QUESTIONS_PAR_NIVEAU) {
    return { type: "poser_question" };
  }

  // 2) Bloc de 3 répondu : succès si ≥ SEUIL_REUSSITE bonnes.
  const nb_correctes = reponses.filter((r) => r.correct).length;
  const reussi = nb_correctes >= SEUIL_REUSSITE;
  const niveau = etat.niveau_actuel;

  if (reussi) {
    // Promotion possible ?
    const dessus = niveauAuDessus(niveau);
    if (dessus === null) {
      // Déjà au sommet (Expert) → finaliser au sommet.
      return { type: "finaliser_domaine", raison: "plafond" };
    }
    // Si on a déjà échoué au niveau juste au-dessus, convergence.
    if (etat.niveau_min_echoue === dessus) {
      return { type: "finaliser_domaine", raison: "convergence" };
    }
    return { type: "monter_niveau", depuis: niveau, vers: dessus };
  }

  // Échec : descente possible ?
  const dessous = niveauEnDessous(niveau);
  if (dessous === null) {
    // Déjà au plancher (Débutant) et échec → aucun niveau atteint.
    return { type: "finaliser_domaine", raison: "plancher" };
  }
  // Si on a déjà réussi au niveau juste en-dessous, convergence.
  if (etat.niveau_max_reussi === dessous) {
    return { type: "finaliser_domaine", raison: "convergence" };
  }
  return { type: "descendre_niveau", depuis: niveau, vers: dessous };
}

// -----------------------------------------------------------------------------
// Finalisation du domaine courant
// -----------------------------------------------------------------------------
/**
 * Calcule le résultat agrégé du domaine courant.
 *
 * @param historique_reponses Toutes les réponses (correct) données dans le
 *                            domaine courant, tous niveaux confondus.
 * @param niveau_max_reussi   Plus haut niveau réussi pour ce domaine (peut être null).
 * @param a_passe             true si l'utilisateur a "skip" le domaine.
 */
export function finaliserDomaine(
  domaine_id: string,
  historique_reponses: Array<{ correct: boolean }>,
  niveau_max_reussi: NiveauSlug | null,
  a_passe: boolean
): ResultatDomaine {
  if (a_passe) {
    return {
      domaine_id,
      niveau_atteint: null,
      passe: true,
      pourcentage: 0,
      nb_reponses: 0,
      nb_correctes: 0
    };
  }

  const nb_reponses = historique_reponses.length;
  const nb_correctes = historique_reponses.filter((r) => r.correct).length;
  const pourcentage = nb_reponses === 0
    ? 0
    : Math.round((nb_correctes / nb_reponses) * 100);

  return {
    domaine_id,
    niveau_atteint: niveau_max_reussi,
    passe: false,
    pourcentage,
    nb_reponses,
    nb_correctes
  };
}

// -----------------------------------------------------------------------------
// Avancée de domaine
// -----------------------------------------------------------------------------
export function domaineSuivant(
  etat: EtatTest,
  domaines: Pick<Domaine, "id">[]
): { fini: boolean; nouvel_etat: EtatTest } {
  const next_idx = etat.domaine_actuel_idx + 1;
  if (next_idx >= domaines.length) {
    // IMPORTANT : on incrémente quand même l'index pour signaler "fin du test"
    // aux appelants qui vérifient `domaine_actuel_idx >= contexte.domaines.length`.
    return {
      fini: true,
      nouvel_etat: {
        ...etat,
        domaine_actuel_idx: next_idx,
        reponses_niveau_courant: [],
        question_courante_id: null,
        niveau_max_reussi: null,
        niveau_min_echoue: null
      }
    };
  }
  return {
    fini: false,
    nouvel_etat: {
      ...etat,
      domaine_actuel_idx: next_idx,
      niveau_actuel: "debutant",
      reponses_niveau_courant: [],
      question_courante_id: null,
      niveau_max_reussi: null,
      niveau_min_echoue: null
    }
  };
}

export function niveauIdParSlug(niveaux: Niveau[], slug: NiveauSlug): string {
  const n = niveaux.find((x) => x.slug === slug);
  if (!n) throw new Error(`Niveau introuvable : ${slug}`);
  return n.id;
}

export function slugNiveauParId(niveaux: Niveau[], id: string): NiveauSlug {
  const n = niveaux.find((x) => x.id === id);
  if (!n) throw new Error(`Niveau introuvable : ${id}`);
  return n.slug;
}


/**
 * Met à jour le couple (niveau_max_reussi, niveau_min_echoue) après un bloc.
 */
export function mettreAJourBornes(
  etat: EtatTest,
  reussi: boolean
): { niveau_max_reussi: NiveauSlug | null; niveau_min_echoue: NiveauSlug | null } {
  const niveau = etat.niveau_actuel;
  if (reussi) {
    const idx_cur = ORDRE_NIVEAUX.indexOf(niveau);
    const idx_max = etat.niveau_max_reussi
      ? ORDRE_NIVEAUX.indexOf(etat.niveau_max_reussi)
      : -1;
    return {
      niveau_max_reussi: idx_cur > idx_max ? niveau : etat.niveau_max_reussi,
      niveau_min_echoue: etat.niveau_min_echoue
    };
  }
  const idx_cur = ORDRE_NIVEAUX.indexOf(niveau);
  const idx_min = etat.niveau_min_echoue
    ? ORDRE_NIVEAUX.indexOf(etat.niveau_min_echoue)
    : ORDRE_NIVEAUX.length;
  return {
    niveau_max_reussi: etat.niveau_max_reussi,
    niveau_min_echoue: idx_cur < idx_min ? niveau : etat.niveau_min_echoue
  };
}
