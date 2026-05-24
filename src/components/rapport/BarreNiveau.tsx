import type { NiveauSlug } from "@/lib/supabase/types";

/**
 * Barre de progression à 4 paliers pour visualiser le niveau atteint sur un
 * domaine. Le niveau atteint et les niveaux précédents sont colorés ; le
 * palier Expert est mis en valeur en DORÉ (accent CFO Masqué) quand atteint
 * — c'est le sommet du parcours. Les niveaux non atteints restent grisés.
 */
const PALIERS: Array<{ slug: NiveauSlug; label: string }> = [
  { slug: "debutant",       label: "Débutant" },
  { slug: "intermediaire",  label: "Intermédiaire" },
  { slug: "avance",         label: "Avancé" },
  { slug: "expert",         label: "Expert" }
];

interface Props {
  niveau_atteint: NiveauSlug | null;
}

export function BarreNiveau({ niveau_atteint }: Props) {
  const idx_atteint = niveau_atteint
    ? PALIERS.findIndex((p) => p.slug === niveau_atteint)
    : -1;
  const expert_atteint = niveau_atteint === "expert";

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {PALIERS.map((p, i) => {
          const actif = i <= idx_atteint;
          const dore = expert_atteint && p.slug === "expert";
          return (
            <div
              key={p.slug}
              className={
                "h-2.5 flex-1 rounded-full " +
                (dore ? "bg-accent" : actif ? "bg-primary" : "bg-muted")
              }
              aria-hidden="true"
            />
          );
        })}
      </div>
      <div className="flex gap-1.5 text-[10px] uppercase tracking-wider">
        {PALIERS.map((p, i) => {
          const actif = i <= idx_atteint;
          const dore = expert_atteint && p.slug === "expert";
          return (
            <div
              key={p.slug}
              className={
                "flex-1 text-center " +
                (dore
                  ? "font-semibold text-accent"
                  : actif
                    ? "font-semibold text-primary"
                    : "text-muted-foreground")
              }
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
