"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

interface Props {
  question: {
    id: string;
    type: "choix_multiple" | "vrai_faux" | "formule" | "cas_pratique";
    enonce: string;
    options: Array<{ cle: string; texte: string }> | null;
    temps_alloue_secondes: number;
  };
  disabled?: boolean;
  onSubmit: (reponse: string) => void;
}

export function QuestionView({ question, disabled, onSubmit }: Props) {
  const [reponse, setReponse] = useState("");
  const [tempsRestant, setTempsRestant] = useState(question.temps_alloue_secondes);
  const reponseRef = useRef("");
  const autoSoumisRef = useRef(false);

  // Garde une référence sur la réponse courante pour l'auto-soumission (sinon
  // le timer capture la valeur initiale "" via la closure).
  useEffect(() => {
    reponseRef.current = reponse;
  }, [reponse]);

  // Reset à chaque changement de question.
  useEffect(() => {
    setReponse("");
    setTempsRestant(question.temps_alloue_secondes);
    autoSoumisRef.current = false;
    reponseRef.current = "";
  }, [question.id, question.temps_alloue_secondes]);

  // Compte à rebours : tick à chaque seconde.
  useEffect(() => {
    if (disabled || autoSoumisRef.current) return;
    if (tempsRestant <= 0) {
      // Expiration : auto-soumettre (une seule fois) la réponse courante,
      // même si vide. Le moteur traitera "" comme une mauvaise réponse.
      if (!autoSoumisRef.current) {
        autoSoumisRef.current = true;
        onSubmit(reponseRef.current);
      }
      return;
    }
    const timer = setTimeout(() => setTempsRestant((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [tempsRestant, disabled, onSubmit]);

  const peutValider = reponse.trim().length > 0;
  const pourcentage = Math.max(
    0,
    Math.min(100, (tempsRestant / question.temps_alloue_secondes) * 100)
  );
  const alerte = tempsRestant <= 10;

  function envoyer(e?: React.FormEvent) {
    e?.preventDefault();
    if (!peutValider || autoSoumisRef.current) return;
    autoSoumisRef.current = true;
    onSubmit(reponse);
  }

  function formatTemps(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  }

  return (
    <form onSubmit={envoyer} className="space-y-6">
      {/* Compte à rebours visuel */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span
            className={
              "inline-flex items-center gap-1.5 font-medium tabular-nums " +
              (alerte ? "text-destructive" : "text-muted-foreground")
            }
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTemps(Math.max(0, tempsRestant))}
          </span>
          <span className="text-xs text-muted-foreground">
            temps alloué : {question.temps_alloue_secondes}s
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={
              "h-full transition-all duration-1000 ease-linear " +
              (alerte ? "bg-destructive" : "bg-primary")
            }
            style={{ width: pourcentage + "%" }}
            aria-hidden
          />
        </div>
      </div>

      <p className="whitespace-pre-line text-base leading-relaxed">{question.enonce}</p>

      {question.type === "choix_multiple" || question.type === "cas_pratique" ? (
        <fieldset className="space-y-2" disabled={disabled}>
          {(question.options ?? []).map((opt) => {
            const id = `opt-${question.id}-${opt.cle}`;
            return (
              <label
                key={opt.cle}
                htmlFor={id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/10 ${
                  reponse === opt.cle ? "border-primary bg-primary/5" : ""
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`reponse-${question.id}`}
                  value={opt.cle}
                  checked={reponse === opt.cle}
                  onChange={() => setReponse(opt.cle)}
                  className="mt-1"
                />
                <span>
                  <strong className="font-semibold uppercase">{opt.cle}.</strong>{" "}
                  {opt.texte}
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      {question.type === "vrai_faux" ? (
        <fieldset className="grid grid-cols-2 gap-3" disabled={disabled}>
          {(["vrai", "faux"] as const).map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase transition-colors hover:bg-accent/10 ${
                reponse === v ? "border-primary bg-primary/5 text-primary" : ""
              }`}
            >
              <input
                type="radio"
                name={`reponse-${question.id}`}
                value={v}
                checked={reponse === v}
                onChange={() => setReponse(v)}
                className="sr-only"
              />
              {v}
            </label>
          ))}
        </fieldset>
      ) : null}

      {question.type === "formule" ? (
        <div className="space-y-2">
          <Label htmlFor={`formule-${question.id}`}>Saisissez votre formule</Label>
          <Input
            id={`formule-${question.id}`}
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            disabled={disabled}
            placeholder="=…"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Astuce : commencez votre formule par <code>=</code>. La casse et les espaces ne sont pas pris en compte.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={!peutValider || disabled}>
          {t.test.valider}
        </Button>
      </div>
    </form>
  );
}
