import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QuestionForm } from "@/components/admin/question-form";

interface Props {
  params: { id: string };
}

export default async function ModifierQuestionPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const [{ data: question }, { data: domaines }, { data: niveaux }] =
    await Promise.all([
      supabase.from("questions").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("domaines").select("id, nom").order("ordre"),
      supabase.from("niveaux").select("id, nom, ordre").order("ordre")
    ]);

  if (!question) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Modifier la question</h1>
      <QuestionForm
        initiale={question}
        domaines={domaines ?? []}
        niveaux={niveaux ?? []}
      />
    </div>
  );
}
