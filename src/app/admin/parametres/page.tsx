import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chargerParametres } from "@/lib/parametres";
import { ParametresForm } from "@/components/admin/parametres-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminParametresPage() {
  // La table `parametres` est protégée par RLS : on lit via le client
  // service_role (la page est déjà protégée par l'auth du layout admin).
  const admin = createSupabaseAdminClient();
  const params = await chargerParametres(admin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Réglages généraux du test de positionnement.
        </p>
      </div>

      <div className="rounded-md border bg-card p-6">
        <h2 className="text-base font-semibold">Reprise du test</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Contrôle la fréquence à laquelle une même adresse courriel peut
          repasser le test.
        </p>
        <ParametresForm initialDelai={params.delai_reprise_mois} />
      </div>
    </div>
  );
}
