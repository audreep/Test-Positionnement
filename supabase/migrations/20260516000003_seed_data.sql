-- =============================================================================
-- Migration 003 — Données initiales (seed)
-- 6 domaines, 4 niveaux, 2 questions placeholder par domaine/niveau Débutant,
-- quelques formations témoin tirées du catalogue lecfomasque.com.
-- =============================================================================

-- Niveaux (ordre = position dans la progression)
insert into public.niveaux (slug, nom, ordre) values
  ('debutant',     'Débutant',     1),
  ('intermediaire','Intermédiaire',2),
  ('avance',       'Avancé',       3),
  ('expert',       'Expert',       4)
on conflict (slug) do nothing;

-- Domaines
insert into public.domaines (slug, nom, description, ordre) values
  ('formules',                   'Formules',                   'Fonctions Excel : recherche, logique, texte, dates.', 1),
  ('tableaux-croises-dynamiques','Tableaux croisés dynamiques','Création, segments, champs calculés, analyse.',       2),
  ('modelisation-financiere',    'Modélisation financière',    'Budgets, prévisions, analyse de sensibilité.',        3),
  ('vba',                        'VBA',                        'Macros, automatisation, programmation Excel.',        4),
  ('power-query',                'Power Query',                'Importation, transformation, langage M.',             5),
  ('power-pivot',                'Power Pivot',                'Modèles de données, DAX, relations.',                 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Questions placeholder (2 par domaine au niveau Débutant)
-- Objectif Phase 1 : permettre de traverser le parcours.
-- L'admin pourra ajouter, modifier, ou désactiver via l'interface.
-- ---------------------------------------------------------------------------
do $$
declare
  d_id     uuid;
  n_deb_id uuid;
  d        record;
begin
  select id into n_deb_id from public.niveaux where slug = 'debutant';

  for d in select id, slug, nom from public.domaines loop
    d_id := d.id;

    -- Question 1 : choix multiple générique
    insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, ordre)
    values (
      d_id, n_deb_id, 'choix_multiple',
      'Question d''exemple (Débutant – ' || d.nom || ') : laquelle de ces affirmations est vraie au sujet de « ' || d.nom || ' » ?',
      jsonb_build_array(
        jsonb_build_object('cle','a','texte','Affirmation A (correcte – placeholder)'),
        jsonb_build_object('cle','b','texte','Affirmation B'),
        jsonb_build_object('cle','c','texte','Affirmation C'),
        jsonb_build_object('cle','d','texte','Affirmation D')
      ),
      'a',
      1
    );

    -- Question 2 : vrai/faux
    insert into public.questions (domaine_id, niveau_id, type, enonce, bonne_reponse, ordre)
    values (
      d_id, n_deb_id, 'vrai_faux',
      'Vrai ou faux ? Cette affirmation portant sur « ' || d.nom || ' » est exacte. (placeholder)',
      'vrai',
      2
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Formations témoin (à compléter via l'interface admin)
-- ---------------------------------------------------------------------------
insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - Mise à niveau', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-mise-a-niveau/',
       'Survole les fonctions et fonctionnalités intermédiaires d''Excel. Recommandée avant Modélisation financière (niveau 1).'
from public.domaines d, public.niveaux n
where d.slug='formules' and n.slug='debutant';

insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - Tableaux de bord (niveau 1)', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-tableaux-de-bord-niveau-1/',
       'Introduction à l''élaboration de tableaux de bord et aux fonctionnalités avancées des TCD.'
from public.domaines d, public.niveaux n
where d.slug='tableaux-croises-dynamiques' and n.slug='intermediaire';

insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - Modélisation financière (niveau 1)', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-modelisation-financiere-niveau-1/',
       'Introduction aux principes de base et meilleures pratiques en modélisation financière.'
from public.domaines d, public.niveaux n
where d.slug='modelisation-financiere' and n.slug='intermediaire';

insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - VBA (niveau 1)', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-vba-niveau-1/',
       'Introduction à la programmation VBA dans Excel pour automatiser des tâches.'
from public.domaines d, public.niveaux n
where d.slug='vba' and n.slug='intermediaire';

insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - Introduction à Power Query et au langage M', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-introduction-a-power-query-et-au-langage-m/',
       'Importer, transformer et fusionner des données de diverses sources avec Power Query.'
from public.domaines d, public.niveaux n
where d.slug='power-query' and n.slug='intermediaire';

insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description)
select 'Excel - Introduction à Power Pivot et à la modélisation de données', d.id, n.id, '6h', '425$ ou 425 crédits',
       'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-introduction-a-power-pivot-et-a-la-modelisation-de-donnees/',
       'Introduction à la modélisation de données avec Power Pivot, prérequis à DAX.'
from public.domaines d, public.niveaux n
where d.slug='power-pivot' and n.slug='intermediaire';
