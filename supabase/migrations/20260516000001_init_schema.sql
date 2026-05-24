-- =============================================================================
-- Migration 001 — Schéma initial
-- Tables, contraintes, index. Pas de RLS ici (voir migration 002).
-- =============================================================================

-- Activation des extensions utiles
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table domaines (Excel : Formules, TCD, Modélisation financière, VBA, ...)
-- -----------------------------------------------------------------------------
create table public.domaines (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  nom         text not null,
  description text,
  ordre       integer not null default 0,
  actif       boolean not null default true,
  cree_le     timestamptz not null default now()
);
comment on table public.domaines is 'Domaines d''évaluation (extensibles).';

-- -----------------------------------------------------------------------------
-- Table niveaux (Débutant, Intermédiaire, Avancé, Expert)
-- -----------------------------------------------------------------------------
create table public.niveaux (
  id     uuid primary key default uuid_generate_v4(),
  slug   text not null unique,
  nom    text not null,
  ordre  integer not null unique,         -- 1..N, sert au tri et à la progression
  cree_le timestamptz not null default now()
);
comment on table public.niveaux is 'Niveaux de compétence évalués.';

-- -----------------------------------------------------------------------------
-- Table questions
-- -----------------------------------------------------------------------------
-- type :
--   'choix_multiple'  → options[] + bonne_reponse = clé d'option
--   'vrai_faux'       → bonne_reponse ∈ {'vrai','faux'}
--   'formule'         → bonne_reponse ignorée, regex_acceptees utilisé
--   'cas_pratique'    → comme choix_multiple mais avec énoncé long
create table public.questions (
  id              uuid primary key default uuid_generate_v4(),
  domaine_id      uuid not null references public.domaines(id) on delete restrict,
  niveau_id       uuid not null references public.niveaux(id)  on delete restrict,
  type            text not null check (type in ('choix_multiple','vrai_faux','formule','cas_pratique')),
  enonce          text not null,
  options         jsonb,           -- [{cle:'a', texte:'...'}, ...] pour QCM/cas pratique
  bonne_reponse   text,            -- clé d'option ou 'vrai'/'faux'
  regex_acceptees jsonb,           -- ['^=SOMME\\(.+\\)$', ...] pour les formules
  explication     text,            -- affichée pour l'admin et debug seulement
  ordre           integer not null default 0,
  actif           boolean not null default true,
  cree_le         timestamptz not null default now(),
  mise_a_jour_le  timestamptz not null default now()
);
create index questions_domaine_niveau_actif_idx
  on public.questions (domaine_id, niveau_id, actif);

-- -----------------------------------------------------------------------------
-- Table formations (catalogue des formations recommandables)
-- -----------------------------------------------------------------------------
create table public.formations (
  id              uuid primary key default uuid_generate_v4(),
  titre           text not null,
  domaine_id      uuid not null references public.domaines(id) on delete restrict,
  niveau_id       uuid not null references public.niveaux(id)  on delete restrict,
  duree           text,                -- ex: "6h", "3 jours"
  prix            text,                -- ex: "425$ ou 425 crédits"
  url_inscription text not null,
  description     text,
  actif           boolean not null default true,
  cree_le         timestamptz not null default now(),
  mise_a_jour_le  timestamptz not null default now()
);
create index formations_domaine_niveau_actif_idx
  on public.formations (domaine_id, niveau_id, actif);

-- -----------------------------------------------------------------------------
-- Table clients (les personnes qui passent le test)
-- -----------------------------------------------------------------------------
create table public.clients (
  id                          uuid primary key default uuid_generate_v4(),
  prenom                      text not null,
  nom                         text not null,
  courriel                    text not null,        -- normalisé en minuscules
  courriel_normalise          text generated always as (lower(trim(courriel))) stored,
  source_acquisition          text not null check (source_acquisition in ('google','linkedin','reference','infolettre','autre')),
  consentement_marketing      boolean not null,
  date_consentement           timestamptz not null default now(),
  cree_le                     timestamptz not null default now()
);
create unique index clients_courriel_unique on public.clients (courriel_normalise);

-- -----------------------------------------------------------------------------
-- Table tests (instances de tests passés ou en cours)
-- -----------------------------------------------------------------------------
create table public.tests (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  statut          text not null default 'en_cours' check (statut in ('en_cours','complete','abandonne')),
  date_debut      timestamptz not null default now(),
  date_fin        timestamptz,
  score_global    integer,           -- 0..100
  donnees_etat    jsonb not null default '{}'::jsonb,
                  -- {domaine_actuel_idx, niveau_actuel_idx, questions_id_deja_tirees:[], ...}
  cree_le         timestamptz not null default now(),
  mise_a_jour_le  timestamptz not null default now()
);
create index tests_client_idx on public.tests (client_id);
create index tests_statut_idx on public.tests (statut);

-- -----------------------------------------------------------------------------
-- Table reponses (chaque question répondue dans un test)
-- -----------------------------------------------------------------------------
create table public.reponses (
  id              uuid primary key default uuid_generate_v4(),
  test_id         uuid not null references public.tests(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete restrict,
  reponse_donnee  text,
  correct         boolean not null,
  temps_passe_ms  integer,
  cree_le         timestamptz not null default now()
);
create index reponses_test_idx on public.reponses (test_id);

-- -----------------------------------------------------------------------------
-- Table scores_par_domaine
-- -----------------------------------------------------------------------------
create table public.scores_par_domaine (
  id                 uuid primary key default uuid_generate_v4(),
  test_id            uuid not null references public.tests(id) on delete cascade,
  domaine_id         uuid not null references public.domaines(id) on delete restrict,
  niveau_atteint_id  uuid references public.niveaux(id),       -- null = non évalué/skip
  pourcentage        integer not null,                          -- 0..100
  nb_reponses        integer not null,
  nb_correctes       integer not null,
  passe              boolean not null default false,            -- TRUE si client a "skip"
  cree_le            timestamptz not null default now()
);
create unique index scores_test_domaine_unique
  on public.scores_par_domaine (test_id, domaine_id);

-- -----------------------------------------------------------------------------
-- Triggers de mise à jour automatique des timestamps
-- -----------------------------------------------------------------------------
create or replace function public.set_mise_a_jour_le()
returns trigger as $$
begin
  new.mise_a_jour_le := now();
  return new;
end;
$$ language plpgsql;

create trigger questions_set_mise_a_jour
  before update on public.questions
  for each row execute function public.set_mise_a_jour_le();

create trigger formations_set_mise_a_jour
  before update on public.formations
  for each row execute function public.set_mise_a_jour_le();

create trigger tests_set_mise_a_jour
  before update on public.tests
  for each row execute function public.set_mise_a_jour_le();
