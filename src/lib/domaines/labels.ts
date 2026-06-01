/** Libellés courts par domaine, pour les axes du radar (les noms complets
 *  débordent). Tout slug inconnu retombe sur le nom complet fourni. */
const LABELS_COURTS: Record<string, string> = {
  formules: "Formules",
  "tableaux-croises-dynamiques": "TCD",
  "modelisation-financiere": "Modélisation",
  vba: "VBA",
  "power-query": "Power Query",
  "power-pivot": "Power Pivot"
};

export function labelCourtDomaine(slug: string, nomComplet: string): string {
  return LABELS_COURTS[slug] ?? nomComplet;
}
