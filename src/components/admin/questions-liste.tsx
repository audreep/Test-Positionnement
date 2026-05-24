"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface QuestionLigne {
  id: string;
  enonce: string;
  type: string;
  actif: boolean;
  ordre: number;
  domaine_id: string;
  niveau_id: string;
  domaine_nom: string;
  niveau_nom: string;
  niveau_ordre: number;
}

interface Domaine { id: string; nom: string }
interface Niveau { id: string; nom: string; ordre: number }

interface Props {
  questions: QuestionLigne[];
  domaines: Domaine[];
  niveaux: Niveau[];
}

const TOUS = "__tous__";

export function QuestionsListe({ questions, domaines, niveaux }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filtreDomaine, setFiltreDomaine] = useState<string>(TOUS);
  const [filtreNiveau, setFiltreNiveau] = useState<string>(TOUS);
  const [filtreEtat, setFiltreEtat] = useState<"tous" | "actif" | "inactif">("tous");
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [erreur, setErreur] = useState<string | null>(null);

  const niveauxTries = useMemo(
    () => [...niveaux].sort((a, b) => a.ordre - b.ordre),
    [niveaux]
  );

  const questionsFiltrees = useMemo(() => {
    return questions.filter((q) => {
      if (filtreDomaine !== TOUS && q.domaine_id !== filtreDomaine) return false;
      if (filtreNiveau !== TOUS && q.niveau_id !== filtreNiveau) return false;
      if (filtreEtat === "actif" && !q.actif) return false;
      if (filtreEtat === "inactif" && q.actif) return false;
      return true;
    });
  }, [questions, filtreDomaine, filtreNiveau, filtreEtat]);

  const toutesIdsFiltrees = useMemo(
    () => new Set(questionsFiltrees.map((q) => q.id)),
    [questionsFiltrees]
  );
  const toutesSelectionnees =
    questionsFiltrees.length > 0 &&
    questionsFiltrees.every((q) => selection.has(q.id));

  function toggleUne(id: string) {
    const nouvelle = new Set(selection);
    if (nouvelle.has(id)) nouvelle.delete(id);
    else nouvelle.add(id);
    setSelection(nouvelle);
  }

  function toggleToutes() {
    if (toutesSelectionnees) {
      const nouvelle = new Set(selection);
      for (const id of toutesIdsFiltrees) nouvelle.delete(id);
      setSelection(nouvelle);
    } else {
      const nouvelle = new Set(selection);
      for (const id of toutesIdsFiltrees) nouvelle.add(id);
      setSelection(nouvelle);
    }
  }

  function resetFiltres() {
    setFiltreDomaine(TOUS);
    setFiltreNiveau(TOUS);
    setFiltreEtat("tous");
  }

  async function actionBulk(action: "desactiver" | "activer") {
    setErreur(null);
    if (selection.size === 0) return;
    const ids = Array.from(selection);
    const verbe = action === "desactiver" ? "désactiver" : "activer";
    if (
      !confirm(
        `${verbe.charAt(0).toUpperCase() + verbe.slice(1)} ${ids.length} question(s) ? ` +
        (action === "desactiver"
          ? "Elles ne seront plus posées aux nouveaux clients mais resteront en base."
          : "Elles seront à nouveau posées aux nouveaux clients.")
      )
    ) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error ?? "Une erreur est survenue");
        return;
      }
      setSelection(new Set());
      router.refresh();
    });
  }

  const aFiltreActif =
    filtreDomaine !== TOUS || filtreNiveau !== TOUS || filtreEtat !== "tous";

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card p-4">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Domaine
          </label>
          <Select value={filtreDomaine} onValueChange={setFiltreDomaine}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TOUS}>Tous les domaines</SelectItem>
              {domaines.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Niveau
          </label>
          <Select value={filtreNiveau} onValueChange={setFiltreNiveau}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TOUS}>Tous les niveaux</SelectItem>
              {niveauxTries.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            État
          </label>
          <Select value={filtreEtat} onValueChange={(v) => setFiltreEtat(v as "tous" | "actif" | "inactif")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les états</SelectItem>
              <SelectItem value="actif">Actives</SelectItem>
              <SelectItem value="inactif">Inactives</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {aFiltreActif ? (
          <Button variant="ghost" size="sm" onClick={resetFiltres}>
            <X className="mr-1 h-4 w-4" />
            Réinitialiser
          </Button>
        ) : null}
      </div>

      {/* Barre d'actions bulk */}
      {selection.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-medium">
            {selection.size} question(s) sélectionnée(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => actionBulk("activer")}
              disabled={isPending}
            >
              Activer
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => actionBulk("desactiver")}
              disabled={isPending}
            >
              Désactiver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelection(new Set())}
              disabled={isPending}
            >
              Désélectionner
            </Button>
          </div>
        </div>
      ) : null}

      {erreur ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {erreur}
        </div>
      ) : null}

      {/* Compteur */}
      <p className="text-sm text-muted-foreground">
        {questionsFiltrees.length} question(s){" "}
        {aFiltreActif ? `filtrée(s) sur ${questions.length}` : "au total"}.
      </p>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={toutesSelectionnees}
                  onCheckedChange={toggleToutes}
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Énoncé</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {questionsFiltrees.map((q) => (
              <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 align-top">
                  <Checkbox
                    checked={selection.has(q.id)}
                    onCheckedChange={() => toggleUne(q.id)}
                    aria-label={"Sélectionner " + q.enonce.slice(0, 40)}
                  />
                </td>
                <td className="px-4 py-3 align-top">{q.domaine_nom}</td>
                <td className="px-4 py-3 align-top">{q.niveau_nom}</td>
                <td className="px-4 py-3 align-top text-xs uppercase text-muted-foreground">
                  {q.type}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="line-clamp-2 max-w-xl">{q.enonce}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  {q.actif ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/questions/${q.id}`}>Modifier</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {questionsFiltrees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {questions.length === 0
                    ? "Aucune question pour le moment."
                    : "Aucune question ne correspond aux filtres."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BoutonAjouter() {
  return (
    <Button asChild>
      <Link href="/admin/questions/nouvelle">
        <Plus className="mr-2 h-4 w-4" />
        Ajouter
      </Link>
    </Button>
  );
}
