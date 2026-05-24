import { describe, it, expect } from "vitest";
import {
  chainePrerequis,
  construireRecommandations,
  estLacune,
  scoreGlobal,
  trouverRecommandation
} from "../scoring";
import type { Formation, Niveau, NiveauSlug } from "@/lib/supabase/types";
import type { ResultatDomaine } from "../engine";

const NIVEAUX: Niveau[] = [
  { id: "n1", slug: "debutant", nom: "Débutant", ordre: 1, cree_le: "" },
  { id: "n2", slug: "intermediaire", nom: "Intermédiaire", ordre: 2, cree_le: "" },
  { id: "n3", slug: "avance", nom: "Avancé", ordre: 3, cree_le: "" },
  { id: "n4", slug: "expert", nom: "Expert", ordre: 4, cree_le: "" }
];

function formation(
  id: string,
  domaine_id: string,
  niveau_id: string,
  actif = true,
  prerequis_ids: string[] = []
): Formation {
  return {
    id,
    titre: `Formation ${id}`,
    domaine_id,
    niveau_id,
    duree: null,
    prix: null,
    url_inscription: "https://example.com",
    description: null,
    actif,
    prerequis_ids,
    cree_le: "",
    mise_a_jour_le: ""
  };
}

function resultat(over: Partial<ResultatDomaine>): ResultatDomaine {
  return {
    domaine_id: "d1",
    niveau_atteint: null,
    passe: false,
    pourcentage: 0,
    nb_reponses: 0,
    nb_correctes: 0,
    ...over
  };
}

describe("scoreGlobal", () => {
  it("retourne 0 quand aucun domaine évalué", () => {
    expect(scoreGlobal([])).toBe(0);
  });

  it("ignore les domaines passés", () => {
    const r = [
      resultat({ passe: true }),
      resultat({ passe: false, nb_reponses: 6, nb_correctes: 4 })
    ];
    expect(scoreGlobal(r)).toBe(Math.round((4 / 6) * 100));
  });

  it("agrège correctement les réponses sur plusieurs domaines", () => {
    const r = [
      resultat({ domaine_id: "d1", nb_reponses: 6, nb_correctes: 5 }),
      resultat({ domaine_id: "d2", nb_reponses: 9, nb_correctes: 6 })
    ];
    expect(scoreGlobal(r)).toBe(73);
  });
});

describe("estLacune (règle : recommander pour tout niveau < Expert)", () => {
  it("considère un domaine passé comme méritant une recommandation", () => {
    expect(estLacune(resultat({ passe: true }))).toBe(true);
  });

  it("considère un niveau Débutant comme méritant une recommandation", () => {
    expect(estLacune(resultat({ niveau_atteint: "debutant" }))).toBe(true);
  });

  it("considère un niveau Intermédiaire comme méritant une recommandation", () => {
    expect(estLacune(resultat({ niveau_atteint: "intermediaire" }))).toBe(true);
  });

  it("considère un niveau Avancé comme méritant une recommandation", () => {
    expect(estLacune(resultat({ niveau_atteint: "avance" }))).toBe(true);
  });

  it("ne considère pas un niveau Expert comme méritant une recommandation", () => {
    expect(estLacune(resultat({ niveau_atteint: "expert" }))).toBe(false);
  });

  it("considère un échec dès Débutant (niveau null) comme méritant une recommandation", () => {
    expect(estLacune(resultat({ niveau_atteint: null }))).toBe(true);
  });
});

describe("trouverRecommandation", () => {
  it("renvoie la formation de niveau juste au-dessus du niveau atteint", () => {
    const formations: Formation[] = [
      formation("f1", "d1", "n1"),
      formation("f2", "d1", "n2"),
      formation("f3", "d1", "n3")
    ];
    const r = resultat({ domaine_id: "d1", niveau_atteint: "debutant" });
    expect(trouverRecommandation(r, formations, NIVEAUX)?.id).toBe("f2");
  });

  it("renvoie une formation Débutant si l'utilisateur n'a aucun niveau", () => {
    const formations: Formation[] = [
      formation("f1", "d1", "n1"),
      formation("f2", "d1", "n3")
    ];
    const r = resultat({ domaine_id: "d1", niveau_atteint: null });
    expect(trouverRecommandation(r, formations, NIVEAUX)?.id).toBe("f1");
  });

  it("ignore les formations inactives", () => {
    const formations: Formation[] = [
      formation("f1", "d1", "n2", false),
      formation("f2", "d1", "n3", true)
    ];
    const r = resultat({ domaine_id: "d1", niveau_atteint: "debutant" });
    expect(trouverRecommandation(r, formations, NIVEAUX)?.id).toBe("f2");
  });

  it("renvoie null si aucune formation pour ce domaine", () => {
    expect(
      trouverRecommandation(
        resultat({ domaine_id: "d99", niveau_atteint: "debutant" }),
        [],
        NIVEAUX
      )
    ).toBeNull();
  });

  it("fallback intelligent : remonte vers le niveau supérieur si le niveau cible est absent", () => {
    // Catalogue : Débutant (n1) et Expert (n4) uniquement, pas d'Intermédiaire (n2) ni Avancé (n3).
    // Client à Débutant → cible Intermédiaire (n2) → absent → remonte → Avancé (n3) absent → Expert (n4) trouvé.
    const formations: Formation[] = [
      formation("f_deb", "d1", "n1"),
      formation("f_exp", "d1", "n4")
    ];
    const r = resultat({ domaine_id: "d1", niveau_atteint: "debutant" });
    expect(trouverRecommandation(r, formations, NIVEAUX)?.id).toBe("f_exp");
  });

  it("fallback intelligent : retourne null si aucune formation au niveau cible OU plus haut", () => {
    // Client à Avancé, cible = Expert, mais le catalogue n'a que du Débutant.
    // Ne doit PAS rétrograder à une formation plus basse que le niveau atteint.
    const formations: Formation[] = [formation("f_deb", "d1", "n1")];
    const r = resultat({ domaine_id: "d1", niveau_atteint: "avance" });
    expect(trouverRecommandation(r, formations, NIVEAUX)).toBeNull();
  });
});

// =============================================================================
// chainePrerequis — chaîne transitive de pré-requis
// =============================================================================
describe("chainePrerequis", () => {
  it("retourne un tableau vide quand la cible n'a pas de pré-requis", () => {
    const cible = formation("c", "d1", "n2");
    const chaine = chainePrerequis(cible, [cible], NIVEAUX, new Map());
    expect(chaine).toEqual([]);
  });

  it("retourne un seul pré-requis quand il y en a un et qu'il n'est pas maîtrisé", () => {
    const p1 = formation("p1", "d1", "n1");
    const cible = formation("c", "d1", "n2", true, ["p1"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", null]]);
    const chaine = chainePrerequis(cible, [p1, cible], NIVEAUX, niveauxMap);
    expect(chaine.map((f) => f.id)).toEqual(["p1"]);
  });

  it("omet un pré-requis déjà maîtrisé (niveau atteint = niveau du pré-requis)", () => {
    // Pré-requis p1 au niveau Débutant ; client est déjà Débutant dans ce domaine
    // → on considère qu'il a passé p1, donc on l'omet de la chaîne.
    const p1 = formation("p1", "d1", "n1");
    const cible = formation("c", "d1", "n2", true, ["p1"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", "debutant"]]);
    const chaine = chainePrerequis(cible, [p1, cible], NIVEAUX, niveauxMap);
    expect(chaine).toEqual([]);
  });

  it("omet un pré-requis déjà dépassé (niveau atteint > niveau du pré-requis)", () => {
    // Cas cross-domaine : la cible est dans le domaine d2 mais son pré-requis
    // est dans d1. Le client est Expert en d1, donc le pré-requis (Avancé) est
    // déjà couvert.
    const p1 = formation("p1", "d1", "n3"); // Avancé en d1
    const cible = formation("c", "d2", "n2", true, ["p1"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([
      ["d1", "expert"],
      ["d2", "debutant"]
    ]);
    const chaine = chainePrerequis(cible, [p1, cible], NIVEAUX, niveauxMap);
    expect(chaine).toEqual([]);
  });

  it("résout la chaîne transitive (p1 → p2 → cible) dans le bon ordre", () => {
    const p1 = formation("p1", "d1", "n1");
    const p2 = formation("p2", "d1", "n2", true, ["p1"]);
    const cible = formation("c", "d1", "n3", true, ["p2"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", null]]);
    const chaine = chainePrerequis(cible, [p1, p2, cible], NIVEAUX, niveauxMap);
    expect(chaine.map((f) => f.id)).toEqual(["p1", "p2"]);
  });

  it("inclut p2 mais omet p1 si le client maîtrise déjà p1", () => {
    const p1 = formation("p1", "d1", "n1");
    const p2 = formation("p2", "d1", "n2", true, ["p1"]);
    const cible = formation("c", "d1", "n3", true, ["p2"]);
    // Client Débutant → a passé p1 (Débutant) mais pas p2 (Intermédiaire)
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", "debutant"]]);
    const chaine = chainePrerequis(cible, [p1, p2, cible], NIVEAUX, niveauxMap);
    expect(chaine.map((f) => f.id)).toEqual(["p2"]);
  });

  it("gère un pré-requis avec plusieurs branches sans doublon", () => {
    // p1 est pré-requis de p2 ET de la cible.
    const p1 = formation("p1", "d1", "n1");
    const p2 = formation("p2", "d1", "n2", true, ["p1"]);
    const cible = formation("c", "d1", "n3", true, ["p1", "p2"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", null]]);
    const chaine = chainePrerequis(cible, [p1, p2, cible], NIVEAUX, niveauxMap);
    expect(chaine.map((f) => f.id)).toEqual(["p1", "p2"]);
  });

  it("ignore les pré-requis inactifs", () => {
    const p1 = formation("p1", "d1", "n1", false);
    const cible = formation("c", "d1", "n2", true, ["p1"]);
    const niveauxMap = new Map<string, NiveauSlug | null>([["d1", null]]);
    const chaine = chainePrerequis(cible, [p1, cible], NIVEAUX, niveauxMap);
    expect(chaine).toEqual([]);
  });
});

describe("construireRecommandations (intègre la chaîne de pré-requis)", () => {
  it("génère une recommandation pour tout domaine non-Expert ayant une formation", () => {
    const formations: Formation[] = [
      formation("f1", "d1", "n2"),
      formation("f2", "d2", "n3"),
      formation("f3", "d3", "n1"),
      formation("f5", "d5", "n4")
    ];
    const resultats: ResultatDomaine[] = [
      resultat({ domaine_id: "d1", niveau_atteint: "debutant", nb_reponses: 3, nb_correctes: 2 }),
      resultat({ domaine_id: "d2", niveau_atteint: "intermediaire", nb_reponses: 6, nb_correctes: 5 }),
      resultat({ domaine_id: "d3", niveau_atteint: null, nb_reponses: 3, nb_correctes: 1 }),
      resultat({ domaine_id: "d4", passe: true }),
      resultat({ domaine_id: "d5", niveau_atteint: "avance", nb_reponses: 9, nb_correctes: 8 }),
      resultat({ domaine_id: "d6", niveau_atteint: "expert", nb_reponses: 12, nb_correctes: 11 })
    ];

    const recos = construireRecommandations(resultats, formations, NIVEAUX);
    expect(recos.map((r) => r.domaine_id).sort()).toEqual(["d1", "d2", "d3", "d5"]);
    for (const r of recos) {
      expect(Array.isArray(r.prerequis_chaine)).toBe(true);
    }
  });

  it("expose la chaîne de pré-requis dans la recommandation", () => {
    const p1 = formation("p1", "d1", "n1");
    const p2 = formation("p2", "d1", "n2", true, ["p1"]);
    const cible = formation("c", "d1", "n3", true, ["p2"]);
    const resultats: ResultatDomaine[] = [
      resultat({ domaine_id: "d1", niveau_atteint: "intermediaire", nb_reponses: 6, nb_correctes: 4 })
    ];
    const recos = construireRecommandations(resultats, [p1, p2, cible], NIVEAUX);
    expect(recos.length).toBe(1);
    expect(recos[0].formation.id).toBe("c");
    // Le client est déjà Intermédiaire → p1 (Débutant) et p2 (Intermédiaire) sont
    // considérés comme maîtrisés → chaîne vide.
    expect(recos[0].prerequis_chaine).toEqual([]);
  });
});
