import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { QuestionsListe, BoutonAjouter } from "@/components/admin/questions-liste";

const t = getTranslations();

interface QuestionAvecJoin {
  id: string;
  enonce: string;
  type: string;
  actif: boolean;
  ordre: number;
  domaine_id: string;
  niveau_id: string;
  domaine: { nom: string } | null;
  niveau: { nom: string; ordre: number } | null;
}

export default async function AdminQuestionsPage() {
  const supabase = createSupabaseServerClient();

  const [questionsRes, domainesRes, niveauxRes] = await Promise.all([
    supabase
      .from("questions")
      .select(`
        id, enonce, type, actif, ordre, domaine_id, niveau_id,
        domaine:domaines(nom),
        niveau:niveaux(nom, ordre)
      `)
      .order("ordre", { ascending: true })
      .limit(1000),
    supabase.from("domaines").select("id, nom").eq("actif", true).order("ordre"),
    supabase.from("niveaux").select("id, nom, ordre").order("ordre")
  ]);

  const questions = ((questionsRes.data ?? []) as unknown as QuestionAvecJoin[]).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    type: q.type,
    actif: q.actif,
    ordre: q.ordre,
    domaine_id: q.domaine_id,
    niveau_id: q.niveau_id,
    domaine_nom: q.domaine?.nom ?? "",
    niveau_nom: q.niveau?.nom ?? "",
    niveau_ordre: q.niveau?.ordre ?? 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.admin.questions}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Banque de questions du test de positionnement.
          </p>
        </div>
        <BoutonAjouter />
      </div>

      <QuestionsListe
        questions={questions}
        domaines={domainesRes.data ?? []}
        niveaux={niveauxRes.data ?? []}
      />
    </div>
  );
}
