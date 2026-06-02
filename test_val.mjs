import { z } from "zod";

function courrielSansIdn(valeur) {
  if (/[^\x00-\x7F]/.test(valeur)) return false;
  const domaine = valeur.split("@")[1] ?? "";
  if (/(^|\.)xn--/i.test(domaine)) return false;
  return true;
}

const courriel = z.string().trim().toLowerCase()
  .email("Adresse courriel invalide").max(160)
  .refine(courrielSansIdn, { message: "Veuillez saisir une adresse courriel valide (vérifiez le domaine, sans accent ni caractère spécial)." });

for (const v of [
  "oboubouh@xn--lecfomasqu-k7a.com",
  "oboubouh@lecfomasqué.com",
  "oboubouh@lecfomasque.com",
  "mp@solutionspellerin.com",
  "test@mail.xn--abc.com",
]) {
  const r = courriel.safeParse(v);
  console.log(r.success ? "OK    " : "REJET ", v, "→", r.success ? r.data : r.error.issues[0].message);
}
