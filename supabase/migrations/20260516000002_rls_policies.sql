-- =============================================================================
-- Migration 002 — Row Level Security (RLS)
--
-- Stratégie :
--   • Le rôle "anon" (utilisé par le frontend public) ne peut JAMAIS lire
--     directement les tables sensibles (clients, tests, réponses, scores).
--     Toutes les opérations du parcours client passent par des routes API
--     côté serveur, qui utilisent la clé SUPABASE_SERVICE_ROLE_KEY.
--   • Le rôle "authenticated" (admin connecté via Supabase Auth) a accès
--     en lecture/écriture à toutes les tables d'admin.
--   • Les tables "publiques" (domaines, niveaux, questions, formations)
--     sont lisibles par les anonymes (nécessaire pour afficher les questions),
--     mais seul "authenticated" peut écrire.
-- =============================================================================

-- Tables de référence (lecture publique, écriture admin)
alter table public.domaines  enable row level security;
alter table public.niveaux   enable row level security;
alter table public.questions enable row level security;
alter table public.formations enable row level security;

create policy "domaines_select_public" on public.domaines
  for select to anon, authenticated using (true);
create policy "domaines_modify_admin" on public.domaines
  for all to authenticated using (true) with check (true);

create policy "niveaux_select_public" on public.niveaux
  for select to anon, authenticated using (true);
create policy "niveaux_modify_admin" on public.niveaux
  for all to authenticated using (true) with check (true);

create policy "questions_select_public" on public.questions
  for select to anon, authenticated using (actif = true);
create policy "questions_select_all_admin" on public.questions
  for select to authenticated using (true);
create policy "questions_modify_admin" on public.questions
  for all to authenticated using (true) with check (true);

create policy "formations_select_public" on public.formations
  for select to anon, authenticated using (actif = true);
create policy "formations_select_all_admin" on public.formations
  for select to authenticated using (true);
create policy "formations_modify_admin" on public.formations
  for all to authenticated using (true) with check (true);

-- Tables sensibles : RLS verrouillée pour anon ; lecture/écriture pour authenticated.
-- Le rôle service_role bypass automatiquement RLS (utilisé par les routes API).
alter table public.clients              enable row level security;
alter table public.tests                enable row level security;
alter table public.reponses             enable row level security;
alter table public.scores_par_domaine   enable row level security;

create policy "clients_admin_only" on public.clients
  for all to authenticated using (true) with check (true);

create policy "tests_admin_only" on public.tests
  for all to authenticated using (true) with check (true);

create policy "reponses_admin_only" on public.reponses
  for all to authenticated using (true) with check (true);

create policy "scores_admin_only" on public.scores_par_domaine
  for all to authenticated using (true) with check (true);

-- Note de sécurité :
-- Le rôle "anon" n'a aucune policy sur clients / tests / reponses / scores,
-- donc aucune ligne ne lui est visible / modifiable.
