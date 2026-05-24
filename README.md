# Le CFO Masqué — Test de positionnement Excel

Application Next.js qui permet à un client potentiel d'évaluer son niveau Excel dans 6 domaines (Formules, Tableaux croisés dynamiques, Modélisation financière, VBA, Power Query, Power Pivot) et reçoit un rapport personnalisé avec des recommandations de formations.

Cette livraison correspond à la **Phase 1** : fondations techniques complètes (auth admin, schéma de base, parcours client adaptatif, génération PDF), avec des questions placeholder. Les variantes IA et l'envoi par courriel seront ajoutés en Phase 2.

## Stack

- **Frontend** : Next.js 14 (App Router, React 18, TypeScript)
- **Style** : Tailwind CSS + shadcn/ui (inline) + lucide-react
- **Base de données + Auth** : Supabase (Postgres, Auth, RLS)
- **PDF** : @react-pdf/renderer (rendu serveur)
- **Validation** : Zod
- **Tests** : Vitest
- **Hébergement cible** : Vercel
- **i18n** : fichiers JSON (FR seulement en Phase 1, prêt pour l'EN en Phase 2)

## Arborescence

```
src/
  app/
    page.tsx                 Page d'accueil publique
    test/                    Parcours client (intake, questions, rapport)
    admin/                   Interface admin (CRUD, clients, dashboard)
    api/                     Routes API (parcours, admin, export, PDF)
  components/
    ui/                      Composants shadcn (button, card, dialog, ...)
    admin/                   Composants admin (forms, actions)
    test/                    Composants parcours client
  lib/
    adaptive/                Moteur adaptatif (engine, scoring, runner)
    supabase/                Clients Supabase (browser, server, admin)
    pdf/                     Templates React-PDF
    i18n/                    Dictionnaire FR + helper de traduction
    validation.ts            Schémas Zod
    utils.ts                 Helpers
  middleware.ts              Protection des routes /admin
supabase/
  migrations/                Migrations SQL versionnées
```

## Prérequis

- Node.js 20+
- npm (ou pnpm/yarn)
- Un compte Supabase (gratuit pour démarrer)
- Un compte Vercel
- (Recommandé) la CLI Supabase : `npm i -g supabase` pour appliquer les migrations en local

## 1. Configuration locale

### 1.1. Installer les dépendances

```bash
npm install
```

### 1.2. Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner les valeurs.

```bash
cp .env.example .env.local
```

Variables minimum requises :

| Variable | Description | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role (jamais côté client) | Dashboard → Settings → API → service_role secret |
| `NEXT_PUBLIC_APP_URL` | URL où l'app est servie | `http://localhost:3000` en dev |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` | URL de la politique de confidentialité | À remplacer par la vraie URL plus tard |

## 2. Initialiser Supabase

### 2.1. Créer le projet

Sur [supabase.com](https://supabase.com), créer un nouveau projet (région : choisir l'est du Canada pour la Loi 25). Noter le mot de passe Postgres et copier les clés API dans `.env.local`.

### 2.2. Appliquer les migrations

**Option A : via le SQL Editor de Supabase (le plus simple pour la Phase 1).**
Dans le dashboard, ouvrir SQL Editor, puis exécuter dans l'ordre :

1. `supabase/migrations/20260516000001_init_schema.sql`
2. `supabase/migrations/20260516000002_rls_policies.sql`
3. `supabase/migrations/20260516000003_seed_data.sql`

**Option B : via la CLI Supabase.**

```bash
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase db push
```

### 2.3. Créer le premier administrateur

Le premier admin est créé **manuellement** dans le dashboard Supabase :

1. Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**
2. Saisir le courriel et le mot de passe
3. **Décocher** « Auto Confirm User » uniquement si vous voulez forcer la vérification courriel. Sinon, cocher pour pouvoir se connecter tout de suite.

Une fois créé, naviguer sur `/admin/login` et se connecter avec ces identifiants. Tout utilisateur Supabase Auth a actuellement accès à la console admin ; en Phase 2, on pourra restreindre via une table `admin_users` et un check additionnel.

### 2.4. Vérifier les politiques RLS

Dans Supabase → Authentication → Policies, vérifier que :
- Les tables `domaines`, `niveaux`, `questions`, `formations` ont des policies de lecture publique.
- Les tables `clients`, `tests`, `reponses`, `scores_par_domaine` n'ont **aucune** policy pour le rôle `anon`.

Pour tester rapidement : depuis un onglet privé, ouvrir la console réseau et appeler `https://VOTRE_PROJET.supabase.co/rest/v1/clients?select=*` avec la clé anonyme. La réponse doit être un tableau vide même s'il y a des clients.

## 3. Lancer en local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

- `/` : page d'accueil publique
- `/test` : parcours client (intake → questions → rapport)
- `/admin/login` : connexion admin
- `/admin` : tableau de bord (une fois connecté)

## 4. Tests

```bash
npm test          # exécute la suite Vitest une fois
npm run test:watch
npm run typecheck # vérification TypeScript
npm run lint
```

La suite Vitest couvre :
- le moteur adaptatif (`src/lib/adaptive/__tests__/engine.test.ts`) : progression de niveau, seuil 2/3, premier échec, formules avec regex, anti-doublon de tirage.
- le scoring et recommandations (`src/lib/adaptive/__tests__/scoring.test.ts`) : score global, identification des lacunes < Intermédiaire, choix de la formation au niveau juste supérieur.

## 5. Déploiement Vercel

### 5.1. Connecter le repo

1. Pousser ce dossier sur un repo Git (GitHub recommandé).
2. Sur Vercel, **Add New Project** → importer le repo.
3. Framework détecté : Next.js.

### 5.2. Variables d'environnement Vercel

Recopier toutes les variables de `.env.local` dans les paramètres du projet Vercel (Settings → Environment Variables). Important : marquer `SUPABASE_SERVICE_ROLE_KEY` comme **Secret**.

### 5.3. Premier déploiement

Cliquer **Deploy**. Une fois en ligne, mettre à jour `NEXT_PUBLIC_APP_URL` avec l'URL de production (ex: `https://test.lecfomasque.com`) et redéployer.

### 5.4. Domaine personnalisé

Configurer un sous-domaine `test.lecfomasque.com` dans Vercel → Settings → Domains et ajouter le CNAME chez le registraire DNS.

## 6. Tester le parcours complet

1. **Vider la base** (optionnel) : Supabase → SQL Editor → `truncate clients cascade;`
2. Aller sur `/test`, remplir le formulaire avec un courriel personnel, cocher les consentements, démarrer.
3. Répondre aux questions placeholder (les bonnes réponses sont la première option, ou « vrai »).
4. Aller jusqu'au bout pour voir le rapport et télécharger le PDF.
5. Se connecter sur `/admin`, vérifier l'apparition du client et du test, exporter le CSV.
6. Tester le bouton « Réinitialiser le test », puis le bouton « Supprimer (Loi 25) ».

## 7. Gérer la banque de questions

Une fois connecté en admin :

- **`/admin/questions`** : liste paginée, créer / modifier / désactiver.
- Chaque question a un **type** (choix multiple, vrai/faux, formule, cas pratique). En Phase 1, les captures d'écran ne sont pas supportées (Phase 2).
- Pour le type **formule**, fournir une ou plusieurs **regex acceptées** (sans délimiteurs, une par ligne). La comparaison est insensible à la casse et ignore les espaces.
- Le test tire aléatoirement 3 questions actives par domaine et niveau. La progression suit la logique adaptative (montée tant qu'on obtient ≥ 2/3, arrêt au premier échec).

## 8. Branding

La palette par défaut est configurée dans `tailwind.config.ts` (clé `cfo`) et `src/app/globals.css` (variables HSL). Pour matcher exactement le branding de [lecfomasque.com](https://www.lecfomasque.com) :

1. Ouvrir le site et inspecter une couleur d'accent (par exemple sur un bouton).
2. Mettre à jour les variables `--primary`, `--accent`, etc. dans `src/app/globals.css`.
3. Mettre à jour aussi `tailwind.config.ts` → `theme.extend.colors.cfo` pour conserver la cohérence.
4. Remplacer le carré bleu placeholder (`<div className="h-8 w-8 rounded-md bg-primary" />`) par le logo SVG du CFO Masqué dans `src/app/page.tsx`, `src/app/admin/layout.tsx`, etc.

## 9. Conformité Loi 25 (Québec)

- **Consentement explicite** : le formulaire d'intake exige les deux cases à cocher (marketing + lecture de la politique). La date de consentement est horodatée dans `clients.date_consentement`.
- **Suppression sur demande** : dans `/admin/clients/[id]`, le bouton « Supprimer (Loi 25) » efface définitivement le client et toutes ses données dérivées (cascade SQL).
- **Politique de confidentialité** : URL configurable via `NEXT_PUBLIC_PRIVACY_POLICY_URL`. À remplacer par l'URL réelle avant la mise en production.

## 10. Ce qui n'est pas dans la Phase 1

- Questions à captures d'écran (reporté en Phase 2)
- Génération de variantes via Claude Sonnet (Phase 2)
- Envoi du rapport par courriel via Klaviyo (Phase 2)
- Multilingue EN/FR actif (structure prête, dictionnaire à compléter)
- Comparaison avec moyenne des autres clients (activable à partir de 20 répondants/segment, Phase 2)
- Restriction admin via table `admin_users` (actuellement tout utilisateur Supabase Auth peut accéder)
- Tests E2E (Playwright) — uniquement tests unitaires Vitest en Phase 1

## 11. Aide & dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Variables d'environnement Supabase manquantes` au démarrage | `.env.local` non chargé | Vérifier le fichier, redémarrer `npm run dev` |
| Erreur 401 sur `/api/admin/...` | Pas connecté à l'admin | Aller sur `/admin/login` |
| Le client peut voir des données via la clé anon | RLS non activée | Réexécuter la migration 002 |
| Le PDF est vide / erreur de rendu | Test pas marqué `complete` | Vérifier `tests.statut = 'complete'` en base |
| Build Vercel échoue sur `@react-pdf/renderer` | Lib externe non isolée | Vérifier `next.config.mjs` → `serverComponentsExternalPackages` |

---

© Le CFO Masqué Inc. — Outil interne, distribution non publique.
