import { Svg, Polygon, Line, Circle, Text } from "@react-pdf/renderer";
import type { NiveauSlug } from "@/lib/supabase/types";
import {
  geometrieRadar,
  anneauPolygone,
  valeurNiveau
} from "@/lib/rapport/radar";
import { labelCourtDomaine } from "@/lib/domaines/labels";

const COULEUR_PRIMAIRE = "#2673BA";
const COULEUR_GRILLE = "#D9E2EC";
const COULEUR_TEXTE = "#64748B";

interface DomaineRadar {
  domaine_slug: string;
  domaine_nom: string;
  niveau_atteint: NiveauSlug | null;
}

/**
 * Radar des domaines évalués pour le PDF (primitives @react-pdf/Svg).
 * Reprend la géométrie partagée avec la version web.
 */
export function RadarPDF({ domaines }: { domaines: DomaineRadar[] }) {
  if (domaines.length < 3) return null;

  const TAILLE = 168;
  const RAYON = 54;
  const geo = geometrieRadar(
    domaines.map((d) => ({
      label: labelCourtDomaine(d.domaine_slug, d.domaine_nom),
      valeur: valeurNiveau(d.niveau_atteint)
    })),
    TAILLE,
    RAYON
  );

  return (
    <Svg width={210} height={TAILLE} viewBox={`-32 0 232 ${TAILLE}`}>
      {geo.anneaux.map((f) => (
        <Polygon
          key={`a${f}`}
          points={anneauPolygone(geo, f)}
          fill="none"
          stroke={COULEUR_GRILLE}
          strokeWidth={0.75}
        />
      ))}

      {geo.points.map((p) => (
        <Line
          key={`l${p.label}`}
          x1={geo.cx}
          y1={geo.cy}
          x2={p.axeX}
          y2={p.axeY}
          stroke={COULEUR_GRILLE}
          strokeWidth={0.75}
        />
      ))}

      <Polygon
        points={geo.polygone}
        fill={COULEUR_PRIMAIRE}
        fillOpacity={0.22}
        stroke={COULEUR_PRIMAIRE}
        strokeWidth={1.5}
      />

      {geo.points.map((p) => (
        <Circle key={`c${p.label}`} cx={p.x} cy={p.y} r={2.2} fill={COULEUR_PRIMAIRE} />
      ))}

      {geo.points.map((p) => (
        <Text
          key={`t${p.label}`}
          x={p.labelX}
          y={p.labelY + 2}
          style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}
          fill={COULEUR_TEXTE}
          textAnchor={p.ancrage}
        >
          {p.label}
        </Text>
      ))}
    </Svg>
  );
}
