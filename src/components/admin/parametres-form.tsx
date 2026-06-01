"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ParametresForm({ initialDelai }: { initialDelai: number }) {
  const router = useRouter();
  const [delai, setDelai] = useState(String(initialDelai));
  const [message, setMessage] = useState<{ type: "ok" | "err"; texte: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function enregistrer() {
    setMessage(null);
    const valeur = Number(delai);
    if (!Number.isInteger(valeur) || valeur < 0 || valeur > 120) {
      setMessage({ type: "err", texte: "Saisissez un entier entre 0 et 120." });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/parametres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delai_reprise_mois: valeur })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", texte: data.error ?? "Échec de l'enregistrement." });
        return;
      }
      setMessage({ type: "ok", texte: "Paramètre enregistré." });
      router.refresh();
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="delai_reprise_mois">
          Délai avant qu&apos;un même courriel puisse repasser le test (en mois)
        </Label>
        <Input
          id="delai_reprise_mois"
          type="number"
          min={0}
          max={120}
          step={1}
          value={delai}
          onChange={(e) => setDelai(e.target.value)}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Mettez <strong>0</strong> pour autoriser une reprise immédiate (aucune
          restriction). Valeur recommandée : 3 mois.
        </p>
      </div>

      {message ? (
        <p
          className={
            "text-sm " +
            (message.type === "ok" ? "text-emerald-600" : "text-destructive")
          }
        >
          {message.texte}
        </p>
      ) : null}

      <Button onClick={enregistrer} disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </div>
  );
}
