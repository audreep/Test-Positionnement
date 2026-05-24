import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FormationForm } from "@/components/admin/formation-form";

interface Props { params: { id: string } }

export default async function ModifierFormationPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const [{ data: formation }, { data: domaines }, { data: niveaux }] =
    await Promise.all([
      supabase.from("formations").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("domaines").select("id, nom").order("ordre"),
      supabase.from("niveaux").select("id, nom, ordre").order("ordre")
    ]);
  if (!formation) notFound();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Modifier la formation</h1>
      <FormationForm
        initiale={formation}
        domaines={domaines ?? []}
        niveaux={niveaux ?? []}
      />
    </div>
  );
}
