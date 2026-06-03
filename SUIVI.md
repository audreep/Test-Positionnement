# Suivi du projet — Évaluation de votre niveau Excel (Le CFO Masqué)

Journal des modifications, par date. La plus récente en haut.

---

## 3 juin 2026

### Fusion Supabase : projet « Test Positionnement » → projet CRM (code — à déployer)
- **Pourquoi** : réduire les frais Supabase (3 projets forçaient le plan Pro ; objectif 1 seul projet = 25 $/mois).
- **Base de données** : les 9 tables ont été recréées dans le projet CRM (`mxmbohhycupvkzvxuyjn`) avec le préfixe **`tp_`** (`tp_questions`, `tp_clients`, etc.) pour éviter toute collision avec les tables du CRM. Données copiées intégralement (312 questions, 19 formations, clients/tests/réponses), triggers et index reproduits. RLS resserré : lecture/écriture réservées au rôle `admin` (le parcours public passe par la clé service_role, inchangé).
- **Code** : tous les `.from("...")` et relations imbriquées renommés `tp_*` (y compris `types.ts`) ; `.env.local` et `.env.example` pointent vers le projet CRM.
- **Auth admin = comptes CRM** : seuls les comptes avec `app_metadata.role = 'admin'` (pellerin.audree@gmail.com, kleblanc@lecfomasque.com) ont accès à `/admin` — vérifié dans le middleware, le layout, la page de login et les 15 routes API admin.
- **À faire pour déployer** : (1) mettre à jour les 3 variables Supabase sur Vercel (URL + anon + service_role du projet CRM), (2) commit + push, (3) tester le parcours public + l'admin, (4) demander à Claude la synchro finale des données, (5) supprimer le projet Supabase « Test Positionnement ».
- ⚠️ Incident durant la séance : un renommage en masse via la sandbox a corrompu des fichiers (cache OneDrive) ; restauration complète via « Discard all changes » (Git) puis réapplication fiable. Leçon : les modifications de code de ce projet doivent passer par l'accès direct Windows.

---

## 2 juin 2026

### Option « Je ne sais pas » aux questions à choix (code — à déployer)
- Ajout d'une option **« Je ne sais pas »** sous les choix, pour les questions de type **choix multiple** et **cas pratique** — permet de passer une question au lieu de répondre au hasard.
- Implémentée à l'affichage (`question-view.tsx`) via une valeur sentinelle ; aucune modification de la banque de questions.
- **Scoring** : comptée comme **réponse incorrecte** (compétence non maîtrisée). Le moteur adaptatif (blocs de 3) est inchangé. Donne un score plus juste qu'un coup de chance.
- Libellés ajoutés dans `fr.json` (`test.je_ne_sais_pas`, `test.je_ne_sais_pas_aide`).
- Vrai/Faux non touché (choix volontaire).

### Validation du courriel — refus des domaines internationalisés (code — à déployer)
- **Problème** : un courriel à domaine accentué (ex. « lecfomasqué.com », autocorrection de « lecfomasque.com ») était encodé en Punycode par le navigateur (« xn--lecfomasqu-k7a.com ») puis enregistré tel quel, et s'affichait ainsi dans le rapport/PDF.
- **Correctif** : `intakeSchema.courriel` refuse désormais les domaines IDN — étiquette Punycode `xn--` ou caractères non ASCII — avec un message invitant à saisir une adresse valide (sans accent ni caractère spécial). S'applique côté formulaire ET côté API (même schéma Zod).
- À noter : la fiche existante de Ouafae Boubouh contient encore l'adresse encodée ; à corriger manuellement en base si souhaité (probablement `oboubouh@lecfomasque.com`).

### Rapport à l'écran — radar agrandi (code — à déployer)
- Le radar de profil passait de `max-w-[330px]` à **`max-w-[440px]`** (largeur à l'écran). Inchangé dans le PDF.

### Rapport à l'écran élargi (code — à déployer)
- La page du rapport passait par `container-narrow` (~672 px), jugée trop étroite. Élargie à `max-w-4xl` (~896 px).
- Changement local à la page rapport seulement : le parcours du test (qui partage `container-narrow`) garde sa largeur étroite, adaptée à la lecture des questions.

### Correction du pré-requis « Traitement » (base de données + migration)
- **Bug** : dans le rapport, « Excel - Modélisation financière (niveau 1) » apparaissait comme pré-requis de « Excel - Traitement, manipulation et analyse de données ». C'était une erreur de données.
- **Cause** : la migration `20260524000007_prerequis_formations_v2.sql` fixait `prerequis_ids` de Traitement vers MF N1 (« Traitement requiert formellement MF N1 »).
- **Correctif** : le seul pré-requis de Traitement est maintenant **« Excel - Mise à niveau »**. Chaîne résolue : Traitement → Mise à niveau → Les bases.
- Appliqué **en base** (UPDATE direct sur le projet Supabase) + migration 007 corrigée (valeur + commentaire) pour les futurs déploiements.
- Effet : pour un profil ayant déjà atteint le niveau requis en Formules, aucun pré-requis n'est affiché (Mise à niveau et Les bases sont considérés acquis).

---

## 1er juin 2026

### Identité visuelle (code — à déployer)
- Palette alignée sur lecfomasque.com : bleu `#2673BA` + or `#DA8F29` (le teal et l'orange ont été retirés).
- Police **Rubik** (au lieu d'Inter), chargée via `next/font`.
- Page d'accueil : héros bleu retravaillé avec formes décoratives et liseré doré.

### Rapport — web et PDF (code — à déployer)
- Ajout d'un **radar de profil** des domaines évalués (s'affiche à partir de 3 domaines).
- Marge ajoutée au radar pour que les libellés latéraux (ex. « Power Query ») ne soient plus tronqués.
- Ajout d'une **icône distinctive par domaine** (Formules, TCD, Modélisation, VBA, Power Query, Power Pivot).
- Ajout d'un **« Plan de formation »** consolidé en tête de rapport, ordonné logiquement (pré-requis d'abord, sans doublon).
- Titres de formation **cliquables** dans le plan du PDF (lien vers la page d'inscription).
- Niveau le plus bas renommé de « Aucun » à **« Novice »**.
- Barre de niveau : le palier Débutant se remplit partiellement quand le niveau est « Novice » (progression en cours).

### Parcours du test (code — à déployer)
- Libellés d'auto-évaluation alignés sur l'échelle finale : **Débutant / Intermédiaire / Avancé** (au lieu de Novice / À l'aise / Expert).
- Échelle cohérente d'un bout à l'autre : Novice → Débutant → Intermédiaire → Avancé → Expert.

### Délai de reprise configurable (code + base de données)
- Nouvelle table `parametres` (singleton) avec `delai_reprise_mois` (défaut **3**) — **créée en base** + fichier de migration `supabase/migrations/20260601000010_parametres.sql`.
- Le moteur ne bloque la reprise que si le dernier test complété date de **moins de N mois** ; au-delà, un nouveau test est permis.
- Nouvelle page **Admin → Paramètres** pour modifier le délai (0 = aucune restriction).
- Message de blocage : indique la **date de reprise possible** + invite à écrire à **info@lecfomasque.com** pour obtenir une copie du résultat le plus récent.
- Note correspondante sur la page d'accueil : « il est possible de passer le test une fois par période de N mois ».

### Administration (code — à déployer)
- Lien « Espace admin » retiré de l'en-tête de l'accueil et déplacé discrètement dans le pied de page.
- Fiche client : ajout de **« Voir le rapport »** et **« Télécharger le PDF »** sur chaque test complété (le rapport est régénérable à tout moment depuis les données conservées).

### Révision de la banque de questions (base de données — déjà actif)
- Portée : 5 domaines (Modélisation, Power Pivot, Power Query, TCD, VBA). **Formules** non touché (révisé manuellement).
- **Choix multiples** : bonnes réponses mélangées aléatoirement aux positions A–D (avant : toujours A).
- **Vrai/Faux** : 10 des 20 énoncés reformulés en affirmations fausses (équilibre 10 Vrai / 10 Faux).
- **Références au CFO Masqué** : les 3 énoncés visibles reformulés en « meilleures pratiques d'affaires » ; toutes les explications admin nettoyées des renvois aux cours. Vérification : 0 référence résiduelle.

### Renommage (code — à déployer)
- L'outil passe de « Test de positionnement Excel » à **« Évaluation de votre niveau Excel »** (accueil, métadonnées, titre du rapport, message de fin).
- URL de production cible : `test.lecfomasque.com` → **`evaluation.lecfomasque.com`** (références mises à jour dans le README et les `.env`).

### Nettoyage des données de test
- Commande SQL fournie pour vider les comptes de test (`truncate table public.clients cascade;`) — à exécuter dans le SQL Editor de Supabase.

---

## À faire / en attente

- [ ] **Committer + pousser** les changements de code via GitHub Desktop (déclenche le déploiement Vercel).
      - Rappel : l'index Git avait été corrompu ; en cas de blocage, fermer GitHub Desktop, supprimer `.git/index.lock` (et `.git/index` si corrompu), rouvrir, puis committer.
- [ ] **Configurer l'URL `evaluation.lecfomasque.com`** :
      1. Vercel → Settings → Domains → ajouter le domaine.
      2. Ajouter le CNAME indiqué chez le fournisseur DNS de `lecfomasque.com`.
      3. Attendre la propagation + l'émission du certificat SSL.
      4. Mettre `NEXT_PUBLIC_APP_URL = https://evaluation.lecfomasque.com` dans Vercel et redéployer.
- [ ] Remplacer l'URL de la politique de confidentialité (`NEXT_PUBLIC_PRIVACY_POLICY_URL`) par la vraie une fois disponible.

---

## Notes de référence

- **Phase 2 (prévu, non commencé)** : variantes de questions via IA, envoi du rapport par courriel (Klaviyo), multilingue EN/FR, comparaison avec la moyenne des répondants.
- Projet Supabase utilisé : `eoysgiwanwkamnyglomi` (Test Positionnement).
- Le champ `explication` des questions est **admin uniquement** (jamais montré au candidat).
