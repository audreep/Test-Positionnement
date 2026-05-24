"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DomaineDeleteButton({ id, nom }: { id: string; nom: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function supprimer() {
    if (!confirm(`Supprimer définitivement le domaine « ${nom} » ? Cette action est irréversible. Le domaine ne peut être supprimé que s'il ne contient ni questions ni formations.`)) return;
    setErreur(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/domaines/" + id, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error ?? "Suppression refusée.");
        return;
      }
      router.push("/admin/domaines");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={supprimer}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-3.5 w-3.5" />
        Supprimer
      </Button>
      {erreur ? (
        <p className="max-w-xs text-right text-xs text-destructive">{erreur}</p>
      ) : null}
    </div>
  );
}
