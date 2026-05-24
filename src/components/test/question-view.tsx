"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

interface Props {
  question: {
    id: string;
    type: "choix_multiple" | "vrai_faux" | "formule" | "cas_pratique";
    enonce: string;
    options: Array<{ cle: string; texte: string }> | null;
  };
  disabled?: boolean;
  onSubmit: (reponse: string) => void;
}

export function QuestionView({ question, disabled, onSubmit }: Props) {
  const [reponse, setReponse] = useState("");

  // Réinitialiser la sélection quand la question change.
  useEffect(() => {
    setReponse("");
  }, [question.id]);

  const peutValider = reponse.trim().length > 0;

  function envoyer(e?: React.FormEvent) {
    e?.preventDefault();
    if (!peutValider) return;
    onSubmit(reponse);
  }

  return (
    <form onSubmit={envoyer} className="space-y-6">
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
