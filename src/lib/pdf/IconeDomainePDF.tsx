import { Svg, Path, Rect } from "@react-pdf/renderer";

/**
 * Icônes de domaine pour le PDF, dessinées avec les primitives @react-pdf
 * à partir des mêmes tracés lucide que la version web (square-function,
 * table-2, trending-up, code, database, layers). Trait uniquement (fill none),
 * couleur héritée via `couleur`.
 */
const TRACES: Record<string, React.ReactNode> = {
  formules: (
    <>
      <Rect x={3} y={3} width={18} height={18} rx={2} />
      <Path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3" />
      <Path d="M9 11.2h5.7" />
    </>
  ),
  "tableaux-croises-dynamiques": (
    <Path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
  ),
  "modelisation-financiere": (
    <>
      <Path d="M22 7L13.5 15.5L8.5 10.5L2 17" />
      <Path d="M16 7L22 7L22 13" />
    </>
  ),
  vba: (
    <>
      <Path d="M16 18L22 12L16 6" />
      <Path d="M8 6L2 12L8 18" />
    </>
  ),
  "power-query": (
    <>
      <Path d="M3 5 A9 3 0 1 0 21 5 A9 3 0 1 0 3 5 Z" />
      <Path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <Path d="M3 12A9 3 0 0 0 21 12" />
    </>
  ),
  "power-pivot": (
    <>
      <Path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <Path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <Path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </>
  )
};

const DEFAUT = (
  <>
    <Path d="M3 3v18h18" />
    <Path d="M7 16V11" />
    <Path d="M12 16V7" />
    <Path d="M17 16v-7" />
  </>
);

export function IconeDomainePDF({
  slug,
  couleur,
  taille = 14
}: {
  slug: string;
  couleur: string;
  taille?: number;
}) {
  const contenu = TRACES[slug] ?? DEFAUT;
  return (
    <Svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      stroke={couleur}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {contenu}
    </Svg>
  );
}
