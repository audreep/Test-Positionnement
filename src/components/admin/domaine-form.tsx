"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Domaine } from "@/lib/supabase/types";

interface Props {
  /** Si fourni : mode édition. Sinon : mode création. */
  initiale?: Domaine;
}

export function DomaineForm({ initiale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const [slug, setSlug] = useState(initiale?.slug ?? "");
  const [nom, setNom] = useState(initiale?.nom ?? "");
  const [description, setDescription] = useState(initiale?.description ?? "");
  const [ordre, setOrdre] = useState(initiale?.ordre ?? 0);
  const [actif, setActif] = useState(initiale?.actif ?? true);

  const estEdition = !!initiale;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const payload = estEdition
      ? { nom, description: description.trim() || null, ordre, actif }
      : { slug, nom, description: description.trim() || null, ordre, actif };

    startTransition(async () => {
      const url = estEdition
        ? "/api/admin/domaines/" + initiale!.id
        : "/api/admin/domaines";
      const method = estEdition ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? "Erreur d'enregistrement.");
        return;
      }
      router.push("/admin/domaines");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug technique {estEdition ? "(non modifiable)" : ""}
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="ex : power-bi"
          required
          disabled={estEdition}
        />
        <p className="text-xs text-muted-foreground">
          Identifiant permanent du domaine. Minuscules, chiffres et tirets uniquement.
          Une fois créé, le slug ne peut plus être modifié car il est référencé
          dans les chaînes de pré-requis et l&apos;internationalisation.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nom">Nom affiché</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex : Power BI"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnelle)</Label>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brève description affichée sur l'écran d'auto-évaluation."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ordre">Ordre d&apos;affichage</Label>
          <Input
            id="ordre"
            type="number"
            value={ordre}
            onChange={(e) => setOrdre(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Plus petit = affiché en premier dans le test.
          </p>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <Checkbox
            id="actif"
            checked={actif}
            onCheckedChange={(v) => setActif(Boolean(v))}
          />
          <Label htmlFor="actif">Domaine actif (proposé aux clients)</Label>
        </div>
      </div>

      {erreur ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {erreur}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/domaines")}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
