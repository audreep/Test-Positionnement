"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface Props {
  clientId: string;
}

export function ClientActions({ clientId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [openSuppression, setOpenSuppression] = useState(false);
  const [openReinit, setOpenReinit] = useState(false);

  function reinitialiser() {
    startTransition(async () => {
      setErreur(null);
      const res = await fetch(`/api/admin/clients/${clientId}/reset`, {
        method: "POST"
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErreur(d.error ?? "Erreur");
        return;
      }
      setOpenReinit(false);
      router.refresh();
    });
  }

  function supprimer() {
    startTransition(async () => {
      setErreur(null);
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErreur(d.error ?? "Erreur");
        return;
      }
      router.push("/admin/clients");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Dialog open={openReinit} onOpenChange={setOpenReinit}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser le test
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le test</DialogTitle>
            <DialogDescription>
              Cette action supprimera tous les tests, réponses et scores existants
              de ce client. Il pourra repasser le test depuis le début.
            </DialogDescription>
          </DialogHeader>
          {erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReinit(false)}>
              Annuler
            </Button>
            <Button onClick={reinitialiser} disabled={isPending}>
              {isPending ? "…" : "Réinitialiser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openSuppression} onOpenChange={setOpenSuppression}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer (Loi 25)
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce client et toutes ses données</DialogTitle>
            <DialogDescription>
              Conformément à la Loi 25 (Québec), cette action supprimera
              définitivement le client, son consentement, son ou ses tests, ses
              réponses et ses scores. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSuppression(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={supprimer} disabled={isPending}>
              {isPending ? "…" : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
