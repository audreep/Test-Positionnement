import type { NiveauSlug } from "@/lib/supabase/types";
import {
  geometrieRadar,
  anneauPolygone,
  valeurNiveau
} from "@/lib/rapport/radar";
import { labelCourtDomaine } from "@/lib/domaines/labels";

interface DomaineRadar {
  domaine_slug: string;
  domaine_nom: string;
  niveau_atteint: NiveauSlug | null;
}

const COULEUR_PRIMAIRE = "#2673BA";
const COULEUR_GRILLE = "#E2E8F0";
const COULEUR_TEXTE = "#64748B";

/**
 * Radar des domaines évalués : vue d'ensemble du profil en un coup d'œil.
 * Rendu SVG pur (composant serveur). N'affiche rien si moins de 3 axes.
 */
export function RadarDomaines({ domaines }: { domaines: DomaineRadar[] }) {
  if (domaines.length < 3) return null;

  const TAILLE = 260;
  const RAYON = 88;
  // Marge horizontale ajoutée au viewBox pour que les libellés latéraux
  // (ex. « Power Query ») ne soient pas tronqués.
  const PAD_X = 58;
  const geo = geometrieRadar(
    domaines.map((d) => ({
      label: labelCourtDomaine(d.domaine_slug, d.domaine_nom),
      valeur: valeurNiveau(d.niveau_atteint)
    })),
    TAILLE,
    RAYON
  );

  return (
    <svg
      viewBox={`${-PAD_X} 0 ${TAILLE + PAD_X * 2} ${TAILLE}`}
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label="Radar de votre niveau par domaine"
    >
      {/* Anneaux de fond */}
      {geo.anneaux.map((f) => (
        <polygon
          key={f}
          points={anneauPolygone(geo, f)}
          fill="none"
          stroke={COULEUR_GRILLE}
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {geo.points.map((p) => (
        <line
          key={p.label}
          x1={geo.cx}
          y1={geo.cy}
          x2={p.axeX}
          y2={p.axeY}
          stroke={COULEUR_GRILLE}
          strokeWidth={1}
        />
      ))}

      {/* Polygone de données */}
      <polygon
        points={geo.polygone}
        fill={COULEUR_PRIMAIRE}
        fillOpacity={0.22}
        stroke={COULEUR_PRIMAIRE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Points de données */}
      {geo.points.map((p) => (
        <circle
          key={p.label}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={COULEUR_PRIMAIRE}
        />
      ))}

      {/* Libellés */}
      {geo.points.map((p) => (
        <text
          key={p.label}
          x={p.labelX}
          y={p.labelY}
          textAnchor={p.ancrage}
          dominantBaseline="middle"
          fontSize={9}
          fontWeight={500}
          fill={COULEUR_TEXTE}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
