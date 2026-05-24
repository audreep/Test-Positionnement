"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Domaine, Formation, Niveau } from "@/lib/supabase/types";

interface Props {
  domaines: Pick<Domaine, "id" | "nom">[];
  niveaux: Pick<Niveau, "id" | "nom" | "ordre">[];
  initiale?: Formation;
}

export function FormationForm({ domaines, niveaux, initiale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const [titre, setTitre] = useState(initiale?.titre ?? "");
  const [domaineId, setDomaineId] = useState(initiale?.domaine_id ?? domaines[0]?.id ?? "");
  const [niveauId, setNiveauId] = useState(initiale?.niveau_id ?? niveaux[0]?.id ?? "");
  const [duree, setDuree] = useState(initiale?.duree ?? "");
  const [prix, setPrix] = useState(initiale?.prix ?? "");
  const [url, setUrl] = useState(initiale?.url_inscription ?? "");
  const [description, setDescription] = useState(initiale?.description ?? "");
  const [actif, setActif] = useState(initiale?.actif ?? true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const payload = {
      titre,
      domaine_id: domaineId,
      niveau_id: niveauId,
      duree: duree || null,
      prix: prix || null,
      url_inscription: url,
      description: description || null,
      actif
    };
    startTransition(async () => {
      const target = initiale
        ? `/api/admin/formations/${initiale.id}`
        : "/api/admin/formations";
      const res = await fetch(target, {
        method: initiale ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? "Erreur d'enregistrement.");
        return;
      }
      router.push("/admin/formations");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titre">Titre</Label>
        <Input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Domaine</Label>
          <Select value={domaineId} onValueChange={setDomaineId}>
            <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
            <SelectContent>
              {domaines.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Niveau visé</Label>
          <Select value={niveauId} onValueChange={setNiveauId}>
            <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
            <SelectContent>
              {niveaux.sort((a, b) => a.ordre - b.ordre).map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duree">Durée (ex. 6h)</Label>
          <Input id="duree" value={duree ?? ""} onChange={(e) => setDuree(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prix">Prix (ex. 425$ ou 425 crédits)</Label>
          <Input id="prix" value={prix ?? ""} onChange={(e) => setPrix(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL d&apos;inscription</Label>
        <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description courte</Label>
        <Textarea id="desc" rows={4} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="actif" checked={actif} onCheckedChange={(v) => setActif(Boolean(v))} />
        <Label htmlFor="actif">Formation active (recommandable)</Label>
      </div>

      {erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/formations")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
