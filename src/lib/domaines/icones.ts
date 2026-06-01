import {
  FunctionSquare,
  Table2,
  TrendingUp,
  Code,
  Database,
  Layers,
  BarChart3,
  type LucideIcon
} from "lucide-react";

/**
 * Associe chaque domaine (par slug) à une icône lucide distinctive.
 * Utilisé dans le rapport web pour repérer rapidement chaque domaine.
 * Tout slug inconnu retombe sur une icône générique.
 */
const ICONES_PAR_SLUG: Record<string, LucideIcon> = {
  formules: FunctionSquare,
  "tableaux-croises-dynamiques": Table2,
  "modelisation-financiere": TrendingUp,
  vba: Code,
  "power-query": Database,
  "power-pivot": Layers
};

export function iconeDomaine(slug: string): LucideIcon {
  return ICONES_PAR_SLUG[slug] ?? BarChart3;
}
