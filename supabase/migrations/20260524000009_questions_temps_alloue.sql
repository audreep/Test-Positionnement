-- =============================================================================
-- Migration 009 — Temps alloué par question
--
-- Ajoute une colonne `temps_alloue_secondes` à la table questions. Permet à
-- l'admin de configurer un délai par question (défaut 60s) et au runner client
-- d'afficher un compte à rebours qui auto-soumet la réponse à l'expiration.
--
-- Pour les questions plus complexes (ex. cas pratiques), l'admin peut
-- augmenter le délai via l'interface admin sans toucher au code.
-- =============================================================================

alter table public.questions
  add column if not exists temps_alloue_secondes int not null default 60
  check (temps_alloue_secondes between 10 and 600);
