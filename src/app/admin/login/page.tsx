"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTranslations } from "@/lib/i18n";

const t = getTranslations();

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courriel, setCourriel] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: courriel,
      password: motDePasse
    });

    if (error) {
      setErreur(error.message);
      setEnCours(false);
      return;
    }

    const redirect = searchParams.get("redirect") ?? "/admin";
    router.replace(redirect);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.admin.connexion_titre}</CardTitle>
          <CardDescription>{t.marque.nom}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courriel">{t.admin.courriel}</Label>
              <Input
                id="courriel"
                type="email"
                value={courriel}
                onChange={(e) => setCourriel(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdp">{t.admin.mot_de_passe}</Label>
              <Input
                id="mdp"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                required
                minLength={8}
              />
            </div>

            {erreur ? (
              <p className="text-sm text-destructive" role="alert">
                {erreur}
              </p>
            ) : null}

            <Button type="submit" disabled={enCours} className="w-full">
              {enCours ? t.commun.chargement : t.admin.se_connecter}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
