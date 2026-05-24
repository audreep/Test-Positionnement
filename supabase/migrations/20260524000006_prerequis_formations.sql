-- =============================================================================
-- Pré-requis entre formations
--
-- Ajoute une colonne `prerequis_ids uuid[]` sur la table `formations` pour
-- stocker, dans l'ordre logique d'exécution, les formations à compléter avant
-- celle-ci. Les pré-requis sont extraits des plans de cours officiels du
-- CFO Masqué (2026-05). Le moteur de recommandation s'appuie sur cette
-- chaîne pour proposer, en plus de la formation cible, les pré-requis non
-- encore maîtrisés par le client.
-- =============================================================================

alter table public.formations
  add column if not exists prerequis_ids uuid[] not null default '{}'::uuid[];

create index if not exists formations_prerequis_ids_idx
  on public.formations using gin (prerequis_ids);

-- ---------------------------------------------------------------------------
-- Helper : récupérer l'ID d'une formation active par son titre (renvoie null
-- si non trouvée). Utilisé uniquement dans cette migration.
-- ---------------------------------------------------------------------------
do $$
declare
  -- IDs des formations du catalogue (titres tels que définis dans
  -- 20260524000005_contenu_cfo_masque.sql).
  f_bases               uuid;
  f_mise_a_niveau_form  uuid;  -- "Excel - Mise à niveau" (domaine Formules)
  f_trucs_de_pro        uuid;
  f_tmad                uuid;  -- "Excel - Traitement, manipulation et analyse de données"

  f_mn_tcd              uuid;  -- "Excel - Mise à niveau (intro TCD)"
  f_tdb1                uuid;
  f_tdb2                uuid;
  f_tdb3                uuid;

  f_mn_mf               uuid;  -- "Excel - Mise à niveau (prérequis MF)"
  f_mf1                 uuid;
  f_mf2                 uuid;
  f_mf3                 uuid;

  f_init_prog           uuid;
  f_vba1                uuid;
  f_vba2                uuid;
  f_vba3                uuid;

  f_pq_init             uuid;
  f_pq_int              uuid;  -- "Excel - Introduction à Power Query et au langage M"
  f_pq_avc              uuid;  -- "Allez plus loin avec Power Query et le langage M"
  f_pq_exp              uuid;

  f_pp_init             uuid;
  f_pp_int              uuid;  -- "Excel - Introduction à Power Pivot et aux modèles de données"
  f_dax_avc             uuid;  -- "Introduction au langage DAX"
  f_dax_exp             uuid;
begin
  select id into f_bases               from public.formations where titre = 'Excel - Les bases';
  select id into f_mise_a_niveau_form  from public.formations where titre = 'Excel - Mise à niveau';
  select id into f_trucs_de_pro        from public.formations where titre = 'Excel - Trucs de pro';
  select id into f_tmad                from public.formations where titre = 'Excel - Traitement, manipulation et analyse de données';

  select id into f_mn_tcd              from public.formations where titre = 'Excel - Mise à niveau (intro TCD)';
  select id into f_tdb1                from public.formations where titre = 'Excel - Tableaux de bord (niveau 1)';
  select id into f_tdb2                from public.formations where titre = 'Excel - Tableaux de bord (niveau 2)';
  select id into f_tdb3                from public.formations where titre = 'Excel - Tableaux de bord (niveau 3)';

  select id into f_mn_mf               from public.formations where titre = 'Excel - Mise à niveau (prérequis MF)';
  select id into f_mf1                 from public.formations where titre = 'Excel - Modélisation financière (niveau 1)';
  select id into f_mf2                 from public.formations where titre = 'Excel - Modélisation financière (niveau 2)';
  select id into f_mf3                 from public.formations where titre = 'Excel - Modélisation financière (niveau 3)';

  select id into f_init_prog           from public.formations where titre = 'Initiation à la programmation';
  select id into f_vba1                from public.formations where titre = 'Excel - VBA (niveau 1)';
  select id into f_vba2                from public.formations where titre = 'Excel - VBA (niveau 2)';
  select id into f_vba3                from public.formations where titre = 'Excel - VBA (niveau 3)';

  select id into f_pq_init             from public.formations where titre = 'Excel - Introduction à Power Query (initiation)';
  select id into f_pq_int              from public.formations where titre = 'Excel - Introduction à Power Query et au langage M';
  select id into f_pq_avc              from public.formations where titre = 'Allez plus loin avec Power Query et le langage M';
  select id into f_pq_exp              from public.formations where titre = 'Allez plus loin avec Power Query et le langage M (expert)';

  select id into f_pp_init             from public.formations where titre = 'Excel - Introduction à Power Pivot (initiation)';
  select id into f_pp_int              from public.formations where titre = 'Excel - Introduction à Power Pivot et aux modèles de données';
  select id into f_dax_avc             from public.formations where titre = 'Introduction au langage DAX';
  select id into f_dax_exp             from public.formations where titre = 'Introduction au langage DAX (expert)';

  -- =========================================================================
  -- Mise à jour des pré-requis. Chaque tableau est ordonné du plus en amont
  -- au plus en aval (c.-à-d. à faire dans l'ordre listé). On NE liste que le
  -- pré-requis immédiat ; la chaîne transitive est résolue côté code.
  -- =========================================================================

  -- ===== FORMULES =====
  -- "Excel - Les bases"           : aucun pré-requis
  update public.formations set prerequis_ids = array[f_bases]::uuid[]              where id = f_mise_a_niveau_form;
  update public.formations set prerequis_ids = array[f_mise_a_niveau_form]::uuid[] where id = f_trucs_de_pro;
  update public.formations set prerequis_ids = array[f_trucs_de_pro]::uuid[]       where id = f_tmad;

  -- ===== TABLEAUX CROISÉS DYNAMIQUES =====
  -- "Excel - Mise à niveau (intro TCD)" : pas de pré-requis interne
  update public.formations set prerequis_ids = array[f_mn_tcd]::uuid[]             where id = f_tdb1;
  update public.formations set prerequis_ids = array[f_tdb1]::uuid[]               where id = f_tdb2;
  update public.formations set prerequis_ids = array[f_tdb2]::uuid[]               where id = f_tdb3;

  -- ===== MODÉLISATION FINANCIÈRE =====
  -- "Excel - Mise à niveau (prérequis MF)" : pas de pré-requis interne
  update public.formations set prerequis_ids = array[f_mn_mf]::uuid[]              where id = f_mf1;
  update public.formations set prerequis_ids = array[f_mf1]::uuid[]                where id = f_mf2;
  update public.formations set prerequis_ids = array[f_mf2]::uuid[]                where id = f_mf3;

  -- ===== VBA =====
  -- "Initiation à la programmation" : aucun pré-requis
  update public.formations set prerequis_ids = array[f_init_prog]::uuid[]          where id = f_vba1;
  update public.formations set prerequis_ids = array[f_vba1]::uuid[]               where id = f_vba2;
  update public.formations set prerequis_ids = array[f_vba2]::uuid[]               where id = f_vba3;

  -- ===== POWER QUERY =====
  -- "Excel - Introduction à Power Query (initiation)" : aucun pré-requis interne
  update public.formations set prerequis_ids = array[f_pq_init]::uuid[]            where id = f_pq_int;
  update public.formations set prerequis_ids = array[f_pq_int]::uuid[]             where id = f_pq_avc;
  update public.formations set prerequis_ids = array[f_pq_avc]::uuid[]             where id = f_pq_exp;

  -- ===== POWER PIVOT =====
  -- "Excel - Introduction à Power Pivot (initiation)" : aucun pré-requis interne
  -- "Power Pivot et modèles de données" requiert formellement TdB N2 (cross-domaine).
  update public.formations set prerequis_ids = array[f_pp_init, f_tdb2]::uuid[]    where id = f_pp_int;
  update public.formations set prerequis_ids = array[f_pp_int]::uuid[]             where id = f_dax_avc;
  update public.formations set prerequis_ids = array[f_dax_avc]::uuid[]            where id = f_dax_exp;
end $$;
