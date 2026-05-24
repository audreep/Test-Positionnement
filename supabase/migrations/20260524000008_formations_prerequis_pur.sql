-- =============================================================================
-- Migration 008 — Formations « purement préparatoires »
--
-- Ajoute un flag `est_prerequis_pur` aux formations. Quand true :
--   • La formation n'est JAMAIS recommandée directement (jamais retournée
--     par trouverRecommandation)
--   • Elle apparaît UNIQUEMENT comme pré-requis dans la chaîne d'une autre
--     formation
--   • Pour la logique « déjà maîtrisée », on utilise une comparaison STRICTE
--     (niveau atteint > niveau du pré-requis) au lieu de ≥, parce que le
--     contenu de cette formation n'est PAS testé dans le quiz et qu'on ne
--     peut donc pas inférer qu'un client à ce niveau l'a déjà acquise.
--
-- Cas d'usage : « Initiation à la programmation » enseigne les concepts
-- généraux de programmation (variables, boucles, conditions). C'est un
-- pré-requis officiel de VBA niveau 1 mais ce n'est pas du VBA. Un client
-- qui atteint le niveau Débutant en VBA via le quiz n'a pas prouvé qu'il
-- connaît ces concepts.
-- =============================================================================

alter table public.formations
  add column if not exists est_prerequis_pur boolean not null default false;

-- Marque Initiation à la programmation comme pure préparatoire.
update public.formations
  set est_prerequis_pur = true
  where titre = 'Initiation à la programmation';

-- Diagnostic.
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.formations where est_prerequis_pur = true;
  raise notice '[008] % formation(s) marquée(s) comme préparatoire pure', v_count;
end $$;
