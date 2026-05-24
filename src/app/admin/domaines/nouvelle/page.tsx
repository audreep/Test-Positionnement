import { DomaineForm } from "@/components/admin/domaine-form";

export default function NouveauDomainePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau domaine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajouter un nouveau domaine évalué dans le test de positionnement.
        </p>
      </div>
      <DomaineForm />
    </div>
  );
}
