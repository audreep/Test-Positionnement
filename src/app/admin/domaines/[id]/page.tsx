import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DomaineForm } from "@/components/admin/domaine-form";
import { DomaineDeleteButton } from "@/components/admin/domaine-delete-button";

interface Props { params: { id: string } }

export default async function ModifierDomainePage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: domaine } = await supabase
    .from("domaines")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!domaine) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Modifier le domaine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{domaine.slug}</code>
          </p>
        </div>
        <DomaineDeleteButton id={domaine.id} nom={domaine.nom} />
      </div>
      <DomaineForm initiale={domaine} />
    </div>
  );
}
