import type { NiveauSlug } from "@/lib/supabase/types";

/** Ordre des paliers → valeur numérique (0 = aucun niveau atteint). */
const VALEUR_NIVEAU: Record<NiveauSlug, number> = {
  debutant: 1,
  intermediaire: 2,
  avance: 3,
  expert: 4
};

export const NIVEAU_MAX = 4;

export function valeurNiveau(slug: NiveauSlug | null): number {
  return slug ? VALEUR_NIVEAU[slug] : 0;
}

export interface PointRadar {
  /** Coordonnée du sommet de l'axe (valeur max). */
  axeX: number;
  axeY: number;
  /** Coordonnée du point de données (proportionnel à la valeur). */
  x: number;
  y: number;
  /** Position du libellé, légèrement au-delà du sommet de l'axe. */
  labelX: number;
  labelY: number;
  /** Ancrage horizontal du libellé selon la position autour du cercle. */
  ancrage: "start" | "middle" | "end";
  label: string;
  valeur: number;
}

export interface GeometrieRadar {
  cx: number;
  cy: number;
  rayon: number;
  points: PointRadar[];
  /** Anneaux de fond (fractions du rayon), du plus grand au plus petit. */
  anneaux: number[];
  /** Chaîne "x,y x,y ..." du polygone de données pour <polygon points=...>. */
  polygone: string;
}

/**
 * Calcule la géométrie d'un radar à N axes. Premier axe au sommet (-90°),
 * puis sens horaire. Géométrie pure (nombres) partagée par le rendu web
 * (SVG DOM) et le rendu PDF (@react-pdf Svg).
 */
export function geometrieRadar(
  domaines: Array<{ label: string; valeur: number }>,
  taille: number,
  rayon: number
): GeometrieRadar {
  const cx = taille / 2;
  const cy = taille / 2;
  const n = domaines.length;

  const points: PointRadar[] = domaines.map((d, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const frac = Math.max(0, Math.min(1, d.valeur / NIVEAU_MAX));
    const axeX = cx + cos * rayon;
    const axeY = cy + sin * rayon;
    const labelR = rayon + 14;
    const lx = cx + cos * labelR;
    const ancrage: PointRadar["ancrage"] =
      Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end";
    return {
      axeX,
      axeY,
      x: cx + cos * rayon * frac,
      y: cy + sin * rayon * frac,
      labelX: lx,
      labelY: cy + sin * labelR,
      ancrage,
      label: d.label,
      valeur: d.valeur
    };
  });

  const polygone = points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");

  return {
    cx,
    cy,
    rayon,
    points,
    anneaux: [1, 0.75, 0.5, 0.25],
    polygone
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Construit la chaîne de points d'un anneau hexagonal/polygonal à fraction donnée. */
export function anneauPolygone(geo: GeometrieRadar, fraction: number): string {
  return geo.points
    .map((p) => {
      const x = geo.cx + (p.axeX - geo.cx) * fraction;
      const y = geo.cy + (p.axeY - geo.cy) * fraction;
      return `${round(x)},${round(y)}`;
    })
    .join(" ");
}
