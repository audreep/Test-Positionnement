-- =============================================================================
-- Migration 007 v2 — Pré-requis entre formations (catalogue authentique)
--
-- Aligne les pré-requis sur les 18 formations RÉELLES du catalogue (après
-- nettoyage des variantes inventées en migration 005 v2).
--
-- Caractéristiques :
--   • Idempotente : peut être ré-appliquée sans danger
--   • Défensive : RAISE NOTICE si un titre n'est pas trouvé
--   • RAISE EXCEPTION si un UPDATE ne touche aucune ligne
--   • Diagnostic final : compte les formations avec/sans pré-requis
--
-- Cas particulier : « Atelier pratique - Power Query et Power Pivot » est
-- présent en 2 lignes (1 pour PQ, 1 pour PP). On set_prereqs sur les 2 par
-- domaine_id pour avoir [Intro PQ + Intro PP] comme pré-requis dans les 2.
-- =============================================================================

alter table public.formations
  add column if not exists prerequis_ids uuid[] not null default '{}'::uuid[];

create index if not exists formations_prerequis_ids_idx
  on public.formations using gin (prerequis_ids);

-- Reset des prérequis (au cas où la migration 006 a laissé des valeurs erronées
-- pointant vers des formations qui n'existent plus).
update public.formations set prerequis_ids = '{}'::uuid[];

-- Helper local : lookup par titre + domaine slug (gère les doublons Atelier).
create or replace function pg_temp.lookup_formation(
  p_titre text, p_domaine_slug text default null
) returns uuid language plpgsql as $func$
declare
  v_id uuid;
begin
  if p_domaine_slug is null then
    select id into v_id from public.formations where titre = p_titre limit 1;
  else
    select f.id into v_id
    from public.formations f
    join public.domaines d on d.id = f.domaine_id
    where f.titre = p_titre and d.slug = p_domaine_slug
    limit 1;
  end if;
  if v_id is null then
    raise notice '[007] Formation introuvable : « % » (domaine: %)', p_titre, coalesce(p_domaine_slug, '<any>');
  end if;
  return v_id;
end;
$func$;

-- Helper local : UPDATE défensif. Échoue si 0 lignes touchées.
create or replace function pg_temp.set_prereqs(
  p_target_id uuid, p_target_label text, p_prereq_ids uuid[]
) returns void language plpgsql as $func$
declare
  v_rows int;
begin
  if p_target_id is null then
    raise notice '[007] SKIP set_prereqs (% introuvable)', p_target_label;
    return;
  end if;
  update public.formations set prerequis_ids = p_prereq_ids where id = p_target_id;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception '[007] UPDATE 0 lignes pour % (id=%)', p_target_label, p_target_id;
  end if;
end;
$func$;

do $$
declare
  -- ===== FORMULES =====
  f_bases        uuid := pg_temp.lookup_formation('Excel - Les bases', 'formules');
  f_mise_a_niv   uuid := pg_temp.lookup_formation('Excel - Mise à niveau', 'formules');
  f_traitement   uuid := pg_temp.lookup_formation('Excel - Traitement, manipulation et analyse de données', 'formules');

  -- ===== TCD =====
  f_tdb1         uuid := pg_temp.lookup_formation('Excel - Tableaux de bord (niveau 1)', 'tableaux-croises-dynamiques');
  f_tdb2         uuid := pg_temp.lookup_formation('Excel - Tableaux de bord (niveau 2)', 'tableaux-croises-dynamiques');
  f_tdb3         uuid := pg_temp.lookup_formation('Excel - Tableaux de bord (niveau 3)', 'tableaux-croises-dynamiques');

  -- ===== MODÉLISATION FINANCIÈRE =====
  f_mf1          uuid := pg_temp.lookup_formation('Excel - Modélisation financière (niveau 1)', 'modelisation-financiere');
  f_mf2          uuid := pg_temp.lookup_formation('Excel - Modélisation financière (niveau 2)', 'modelisation-financiere');
  f_mf3          uuid := pg_temp.lookup_formation('Excel - Modélisation financière (niveau 3)', 'modelisation-financiere');

  -- ===== VBA =====
  f_init_prog    uuid := pg_temp.lookup_formation('Initiation à la programmation', 'vba');
  f_vba1         uuid := pg_temp.lookup_formation('Excel - VBA (niveau 1)', 'vba');
  f_vba2         uuid := pg_temp.lookup_formation('Excel - VBA (niveau 2)', 'vba');
  f_vba3         uuid := pg_temp.lookup_formation('Excel - VBA (niveau 3)', 'vba');

  -- ===== POWER QUERY =====
  f_pq_int       uuid := pg_temp.lookup_formation('Excel - Introduction à Power Query et au langage M', 'power-query');
  f_pq_avc       uuid := pg_temp.lookup_formation('Allez plus loin avec Power Query et le langage M', 'power-query');
  f_atelier_pq   uuid := pg_temp.lookup_formation('Atelier pratique - Power Query et Power Pivot', 'power-query');

  -- ===== POWER PIVOT =====
  f_pp_int       uuid := pg_temp.lookup_formation('Excel - Introduction à Power Pivot et aux modèles de données', 'power-pivot');
  f_dax          uuid := pg_temp.lookup_formation('Introduction au langage DAX', 'power-pivot');
  f_atelier_pp   uuid := pg_temp.lookup_formation('Atelier pratique - Power Query et Power Pivot', 'power-pivot');
begin
  -- ===== FORMULES =====
  -- "Excel - Les bases" : aucun pré-requis
  perform pg_temp.set_prereqs(f_mise_a_niv,  'Mise à niveau',    array[f_bases]::uuid[]);
  -- Traitement requiert formellement MF N1 (PDF p.42)
  perform pg_temp.set_prereqs(f_traitement,  'Traitement',       array[f_mf1]::uuid[]);

  -- ===== TCD =====
  -- TdB N1 requiert Mise à niveau (cross-domaine vers Formules, PDF p.24)
  perform pg_temp.set_prereqs(f_tdb1,        'TdB N1',           array[f_mise_a_niv]::uuid[]);
  perform pg_temp.set_prereqs(f_tdb2,        'TdB N2',           array[f_tdb1]::uuid[]);
  perform pg_temp.set_prereqs(f_tdb3,        'TdB N3',           array[f_tdb2]::uuid[]);

  -- ===== MODÉLISATION FINANCIÈRE =====
  -- MF N1 requiert Mise à niveau (cross-domaine, PDF p.17)
  perform pg_temp.set_prereqs(f_mf1,         'MF N1',            array[f_mise_a_niv]::uuid[]);
  perform pg_temp.set_prereqs(f_mf2,         'MF N2',            array[f_mf1]::uuid[]);
  -- MF N3 requiert MF N1 ET MF N2 (PDF p.22). On liste MF N2 et la chaîne
  -- transitive remontera vers MF N1.
  perform pg_temp.set_prereqs(f_mf3,         'MF N3',            array[f_mf2]::uuid[]);

  -- ===== VBA =====
  -- "Initiation à la programmation" : aucun pré-requis
  perform pg_temp.set_prereqs(f_vba1,        'VBA N1',           array[f_init_prog]::uuid[]);
  perform pg_temp.set_prereqs(f_vba2,        'VBA N2',           array[f_vba1]::uuid[]);
  perform pg_temp.set_prereqs(f_vba3,        'VBA N3',           array[f_vba2]::uuid[]);

  -- ===== POWER QUERY =====
  -- Intro PQ requiert Traitement (cross-domaine vers Formules, PDF p.33)
  perform pg_temp.set_prereqs(f_pq_int,      'Intro PQ',         array[f_traitement]::uuid[]);
  perform pg_temp.set_prereqs(f_pq_avc,      'Allez plus loin PQ', array[f_pq_int]::uuid[]);
  -- Atelier (ligne PQ) requiert Intro PQ + Intro PP (PDF p.39-40)
  perform pg_temp.set_prereqs(f_atelier_pq,  'Atelier (PQ)',     array[f_pq_int, f_pp_int]::uuid[]);

  -- ===== POWER PIVOT =====
  -- Intro PP requiert TdB N2 (cross-domaine vers TCD, PDF p.36)
  perform pg_temp.set_prereqs(f_pp_int,      'Intro PP',         array[f_tdb2]::uuid[]);
  -- DAX requiert Intro PP (PDF p.81)
  perform pg_temp.set_prereqs(f_dax,         'DAX',              array[f_pp_int]::uuid[]);
  -- Atelier (ligne PP) requiert Intro PQ + Intro PP
  perform pg_temp.set_prereqs(f_atelier_pp,  'Atelier (PP)',     array[f_pq_int, f_pp_int]::uuid[]);
end $$;

-- Diagnostic final : combien de formations ont au moins un pré-requis ?
do $$
declare
  v_avec_prereq int;
  v_sans_prereq int;
  v_total int;
begin
  select count(*) into v_avec_prereq from public.formations where array_length(prerequis_ids, 1) > 0;
  select count(*) into v_sans_prereq from public.formations where coalesce(array_length(prerequis_ids, 1), 0) = 0;
  select count(*) into v_total from public.formations;
  raise notice '[007] Résultat : %/% formations AVEC pré-requis, % SANS (attendu : 14 avec, 4 sans)',
    v_avec_prereq, v_total, v_sans_prereq;
end $$;
