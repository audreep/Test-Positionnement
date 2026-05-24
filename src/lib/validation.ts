import { z } from "zod";

/**
 * Schemas Zod pour valider les entrees utilisateur et les payloads d'API.
 */

export const sourceAcquisitionSchema = z.enum([
  "google",
  "linkedin",
  "reference",
  "infolettre",
  "autre"
]);

export const autoEvaluationSchema = z.enum([
  "novice",
  "a_laise",
  "expert",
  "skip",          // Le client dit "Je ne connais pas" → niveau Debutant attribue d'office
  "non_pertinent"  // Le client coche "Ce domaine ne m'interesse pas" → domaine exclu du test et du rapport
]);

export const intakeSchema = z.object({
  prenom: z.string().trim().min(1, "Le prenom est requis").max(80),
  nom: z.string().trim().min(1, "Le nom est requis").max(80),
  courriel: z.string().trim().toLowerCase().email("Adresse courriel invalide").max(160),
  source_acquisition: sourceAcquisitionSchema,
  consentement_marketing: z.literal(true, {
    errorMap: () => ({ message: "Vous devez consentir pour continuer." })
  }),
  accepte_politique: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter la politique de confidentialite." })
  }),
  auto_evaluations: z.record(z.string(), autoEvaluationSchema)
});

export const reponseSchema = z.object({
  test_id: z.string().uuid(),
  question_id: z.string().uuid(),
  reponse_donnee: z.string().min(0).max(2000).nullable().optional(),
  temps_passe_ms: z.number().int().min(0).max(60 * 60 * 1000).optional()
});

export const questionFormSchema = z.object({
  domaine_id: z.string().uuid(),
  niveau_id: z.string().uuid(),
  type: z.enum(["choix_multiple", "vrai_faux", "formule", "cas_pratique"]),
  enonce: z.string().trim().min(5).max(4000),
  options: z.array(z.object({ cle: z.string().min(1).max(10), texte: z.string().min(1).max(500) }))
    .optional().nullable(),
  bonne_reponse: z.string().trim().max(500).nullable().optional(),
  regex_acceptees: z.array(z.string().min(1).max(500)).nullable().optional(),
  explication: z.string().trim().max(2000).nullable().optional(),
  ordre: z.coerce.number().int().min(0).max(9999).default(0),
  actif: z.coerce.boolean().default(true)
});

export const formationFormSchema = z.object({
  titre: z.string().trim().min(2).max(200),
  domaine_id: z.string().uuid(),
  niveau_id: z.string().uuid(),
  duree: z.string().max(50).nullable().optional(),
  prix: z.string().max(50).nullable().optional(),
  url_inscription: z.string().trim().url().max(500),
  description: z.string().max(2000).nullable().optional(),
  actif: z.coerce.boolean().default(true)
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type ReponseInput = z.infer<typeof reponseSchema>;
export type QuestionFormInput = z.infer<typeof questionFormSchema>;
export type FormationFormInput = z.infer<typeof formationFormSchema>;
