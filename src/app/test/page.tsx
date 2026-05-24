import { IntakeForm } from "@/components/test/intake-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export const dynamic = "force-dynamic";

export default async function TestLandingPage() {
  const supabase = createSupabaseAdminClient();
  const { data: domaines } = await supabase
    .from("domaines")
    .select("id, slug, nom, description")
    .eq("actif", true)
    .order("ordre");

  return (
    <main className="min-h-screen bg-background">
      <div className="container-narrow py-12 sm:py-16">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t.marque.nom}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.test.titre}
          </h1>
          <p className="mt-3 text-muted-foreground">{t.test.sous_titre}</p>
        </header>

        <IntakeForm domaines={domaines ?? []} />
      </div>
    </main>
  );
}
