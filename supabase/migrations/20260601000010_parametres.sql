-- =============================================================================
-- Paramètres applicatifs configurables via la console admin.
--
-- Table singleton (une seule ligne, id = 1). Pour l'instant un seul réglage :
--   delai_reprise_mois : délai minimal (en mois) avant qu'un même courriel
--                        puisse repasser le test. 0 = aucune restriction.
--
-- Sécurité : RLS activée SANS policy pour le rôle anon. Seules les clés
-- service_role (client admin côté serveur) peuvent lire/écrire ces paramètres.
-- =============================================================================

create table if not exists public.parametres (
  id              smallint primary key default 1,
  delai_reprise_mois integer not null default 3 check (delai_reprise_mois >= 0),
  mise_a_jour_le  timestamptz not null default now(),
  constraint parametres_singleton check (id = 1)
);

insert into public.parametres (id, delai_reprise_mois)
values (1, 3)
on conflict (id) do nothing;

alter table public.parametres enable row level security;
