import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FormationForm } from "@/components/admin/formation-form";

export default async function NouvelleFormationPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: domaines }, { data: niveaux }] = await Promise.all([
    supabase.from("domaines").select("id, nom").order("ordre"),
    supabase.from("niveaux").select("id, nom, ordre").order("ordre")
  ]);
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Nouvelle formation</h1>
      <FormationForm domaines={domaines ?? []} niveaux={niveaux ?? []} />
    </div>
  );
}
