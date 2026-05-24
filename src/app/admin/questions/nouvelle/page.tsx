import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QuestionForm } from "@/components/admin/question-form";

export default async function NouvelleQuestionPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: domaines }, { data: niveaux }] = await Promise.all([
    supabase.from("domaines").select("id, nom").order("ordre"),
    supabase.from("niveaux").select("id, nom, ordre").order("ordre")
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Nouvelle question</h1>
      <QuestionForm domaines={domaines ?? []} niveaux={niveaux ?? []} />
    </div>
  );
}
