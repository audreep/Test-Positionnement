-- =============================================================================
-- Migration 005 v2 — Catalogue authentique CFO Masqué + questions
--
-- 1. Désactive les anciennes questions placeholder (ordre < 1000)
-- 2. Remplace le catalogue par les 18 formations RÉELLES extraites du PDF
--    « Plans de cours 2026-05 ». Plus aucune variante inventée (les anciens
--    "Mise à niveau (intro TCD)", "Power Pivot (initiation)", etc. ont été
--    supprimés — ils n'existent pas dans le catalogue réel du CFO Masqué).
-- 3. Insère ~96 questions inspirées du contenu pédagogique réel.
--
-- Grille [domaine × niveau] — cases vides : aucune formation au catalogue
-- à ce niveau, le moteur de recommandation utilise un fallback intelligent.
--
--                    Débutant         Intermédiaire   Avancé              Expert
-- Formules           Les bases        Mise à niveau   ―                   Traitement, manip.
-- TCD                ―                TdB N1          TdB N2              TdB N3
-- Mod. financière    ―                MF N1           MF N2               MF N3
-- VBA                Initiation prog. VBA N1          VBA N2              VBA N3
-- Power Query        ―                Intro PQ + M    Allez plus loin PQ  Atelier pratique PQ+PP
-- Power Pivot        ―                Intro PP        Intro DAX           Atelier pratique PQ+PP
--
-- Note : « Atelier pratique - Power Query et Power Pivot » est dupliqué
-- intentionnellement en 2 lignes (une par domaine) car c'est la SEULE
-- formation qui couvre les deux. Ce n'est pas une variante inventée — c'est
-- la même formation, référencée pour les 2 domaines pour les besoins de
-- recommandation.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Désactivation des anciennes questions (préserve l'historique en base)
-- -----------------------------------------------------------------------------
update public.questions set actif = false where ordre < 1000;

-- -----------------------------------------------------------------------------
-- 2. Remplacement du catalogue de formations (18 lignes)
-- -----------------------------------------------------------------------------
delete from public.formations;

do $$
declare
  d_form uuid; d_tcd uuid; d_mf uuid; d_vba uuid; d_pq uuid; d_pp uuid;
  n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_form from public.domaines where slug='formules';
  select id into d_tcd  from public.domaines where slug='tableaux-croises-dynamiques';
  select id into d_mf   from public.domaines where slug='modelisation-financiere';
  select id into d_vba  from public.domaines where slug='vba';
  select id into d_pq   from public.domaines where slug='power-query';
  select id into d_pp   from public.domaines where slug='power-pivot';
  select id into n_deb  from public.niveaux where slug='debutant';
  select id into n_int  from public.niveaux where slug='intermediaire';
  select id into n_avc  from public.niveaux where slug='avance';
  select id into n_exp  from public.niveaux where slug='expert';

  insert into public.formations (titre, domaine_id, niveau_id, duree, prix, url_inscription, description, actif) values

  -- ===== FORMULES (3 formations) =====
  ('Excel - Les bases', d_form, n_deb, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-les-bases/',
   'Introduction au logiciel Excel : classeurs, onglets, cellules, fonctions de base (SOMME, MOYENNE, MIN/MAX, SI), mise en forme et impression. Idéal pour partir du bon pied.', true),

  ('Excel - Mise à niveau', d_form, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-mise-a-niveau/',
   'Niveau intermédiaire : références $absolues, SOMMEPROD, SOMME.SI(.ENS), RECHERCHEV/H, INDEX/EQUIV imbriqué, champs nommés, validation de données, listes dépendantes, valeur cible. Prérequis aux formations avancées.', true),

  ('Excel - Traitement, manipulation et analyse de données', d_form, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-traitement-manipulation-et-analyse-de-donnees/',
   'Pour les usagers experts : collage spécial avancé, Consolider, SOUS.TOTAL, AGREGAT, filtres avancés, fonctions de texte (extraction), fonctions de date (SERIE.JOUR.OUVRE), statistiques (tendance, régression, corrélation, moyennes mobiles).', true),

  -- ===== TABLEAUX CROISÉS DYNAMIQUES (3 formations) =====
  ('Excel - Tableaux de bord (niveau 1)', d_tcd, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-tableaux-de-bord-niveau-1/',
   'Introduction à l''élaboration de tableaux de bord : TCD comme moteur de calcul, optimisation des calculs et de la présentation, graphiques dynamiques, choix du bon type de graphique pour le bon message.', true),

  ('Excel - Tableaux de bord (niveau 2)', d_tcd, n_avc, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-tableaux-de-bord-niveau-2/',
   'Mise en forme conditionnelle (cellules, graphiques, TCD, tableaux Excel), segments, sparklines, contrôles de formulaires (cases à cocher, boutons radio, listes déroulantes), introduction à la suite BI de Microsoft.', true),

  ('Excel - Tableaux de bord (niveau 3)', d_tcd, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-tableaux-de-bord-niveau-3/',
   'Atelier dirigé : élaboration d''un tableau de bord complet à partir d''un cas concret, intégrant TCD avancés, graphiques liés et contrôles. Mise en pratique des niveaux 1 et 2.', true),

  -- ===== MODÉLISATION FINANCIÈRE (3 formations) =====
  ('Excel - Modélisation financière (niveau 1)', d_mf, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-modelisation-financiere-niveau-1/',
   'Meilleures pratiques d''affaires, analyses de sensibilité (1-2 variables), techniques de l''interrupteur, du multiplicateur, du délai, gestionnaire de scénarios, fonctions clés (INDEX, EQUIV, SOMME.SI(.ENS), SOMMEPROD multi-conditions, DECALER, INDIRECT).', true),

  ('Excel - Modélisation financière (niveau 2)', d_mf, n_avc, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-modelisation-financiere-niveau-2/',
   'Lier les 3 états financiers prévisionnels, modélisation de revenus/coûts/salaires (fixes et variables), actifs (amortissement), dettes (crédits rotatifs, long terme), utilisation du Solveur Excel.', true),

  ('Excel - Modélisation financière (niveau 3)', d_mf, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-modelisation-financiere-niveau-3/',
   'Atelier dirigé : modèle financier complet de A à Z avec état des résultats, bilan, flux de trésorerie et sommaire exécutif, qui balance même quand les hypothèses changent.', true),

  -- ===== VBA (4 formations) =====
  ('Initiation à la programmation', d_vba, n_deb, '6h', '265$ ou 265 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/initiation-a-la-programmation/',
   'Concepts fondamentaux de la programmation sans égard à un langage particulier. Prérequis officiel d''Excel - VBA (niveau 1).', true),

  ('Excel - VBA (niveau 1)', d_vba, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-vba-niveau-1/',
   'Enregistreur de macros, écriture VBA, variables, If/Then/Else, Select Case, boucles For/Next et For Each, With/End With, objets (feuilles/classeurs/cellules), débogage, optimisation (ScreenUpdating, etc.).', true),

  ('Excel - VBA (niveau 2)', d_vba, n_avc, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-vba-niveau-2/',
   'InputBox, formulaires personnalisés, fonctions Text/Date VBA, fonctions Excel dans VBA, gestionnaire d''erreurs, Do...Loop, gestion des TCD/tableaux Excel/segments, impression, export PDF, envoi de courriels.', true),

  ('Excel - VBA (niveau 3)', d_vba, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-vba-niveau-3/',
   'Atelier dirigé : créer un outil complet de facturation automatisé (formulaires, base de données interne, génération PDF, suivi des comptes à recevoir, rappels automatiques par courriel).', true),

  -- ===== POWER QUERY (3 formations) =====
  ('Excel - Introduction à Power Query et au langage M', d_pq, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-introduction-a-power-query-et-au-langage-m/',
   'Récupérer et Transformer : transformations de base, fusion de tables, consolidation de fichiers, pivot/dépivot de colonnes, introduction au langage M (listes, tables, calendriers, fonctions conditionnelles).', true),

  ('Allez plus loin avec Power Query et le langage M', d_pq, n_avc, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/allez-plus-loin-avec-power-query-et-le-langage-m/',
   'Techniques avancées d''acquisition, transformation et consolidation via requêtes automatisées. Web scraping, langage M en profondeur, fonctions personnalisées, query folding.', true),

  -- Atelier pratique (formation partagée entre PQ et PP — 1ère occurrence pour PQ)
  ('Atelier pratique - Power Query et Power Pivot', d_pq, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/atelier-pratique-power-query-et-power-pivot/',
   'Atelier dirigé combinant Power Query et Power Pivot : importer, transformer, modéliser et analyser un cas concret de A à Z. Prérequis officiels : Intro PQ + Intro PP.', true),

  -- ===== POWER PIVOT (3 formations) =====
  ('Excel - Introduction à Power Pivot et aux modèles de données', d_pp, n_int, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/excel-introduction-a-power-pivot-et-aux-modeles-de-donnees/',
   'Normalisation, tables de faits vs dimensions, schéma en étoile, KPI, hiérarchies, introduction aux colonnes calculées et mesures DAX, fonctions cube dans Excel.', true),

  ('Introduction au langage DAX', d_pp, n_avc, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/introduction-au-langage-dax-power-bi-et-power-pivot/',
   'Maîtriser DAX : contextes d''évaluation (ligne vs filtre), RELATED, COUNTROWS, FILTER, DISTINCT, VALUES, CALCULATE, ALL, EARLIER, time intelligence, calendriers fiscaux et 4-4-5.', true),

  -- Atelier pratique (formation partagée entre PQ et PP — 2e occurrence pour PP)
  ('Atelier pratique - Power Query et Power Pivot', d_pp, n_exp, '6h', '425$ ou 425 crédits',
   'https://www.lecfomasque.com/formation-informatique-decisionnelle/atelier-pratique-power-query-et-power-pivot/',
   'Atelier dirigé combinant Power Query et Power Pivot : importer, transformer, modéliser et analyser un cas concret de A à Z. Prérequis officiels : Intro PQ + Intro PP.', true);
end $$;



-- -----------------------------------------------------------------------------
-- 3. Nouvelles questions inspirées du contenu pédagogique réel
--    Ordre commence à 1001 pour ne pas entrer en conflit avec les précédentes.
-- -----------------------------------------------------------------------------

-- ============================================================================
-- FORMULES
-- Inspiré de : Excel - Les bases / Mise à niveau / Trucs de pro / Traitement
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='formules';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT (Excel - Les bases)
  (d_id, n_deb, 'choix_multiple', 'Dans Excel, comment appelle-t-on l''ensemble formé d''un fichier (.xlsx) qui peut contenir plusieurs onglets ?',
   '[{"cle":"a","texte":"Un classeur"},{"cle":"b","texte":"Un dossier"},{"cle":"c","texte":"Une feuille de calcul"},{"cle":"d","texte":"Un tableau"}]'::jsonb,
   'a', 'Le classeur (workbook) est le contenant ; les onglets sont des feuilles (worksheets).', 1001, true),

  (d_id, n_deb, 'choix_multiple', 'Quelle fonction utiliser pour obtenir la plus petite valeur d''une plage A1:A20 ?',
   '[{"cle":"a","texte":"=MIN(A1:A20)"},{"cle":"b","texte":"=PETIT(A1:A20)"},{"cle":"c","texte":"=BAS(A1:A20)"},{"cle":"d","texte":"=PETITE.VALEUR(A1:A20)"}]'::jsonb,
   'a', 'MIN renvoie la valeur minimale. PETITE.VALEUR(plage; k) demande un rang k.', 1002, true),

  (d_id, n_deb, 'vrai_faux', 'La fonction SI permet de retourner une valeur différente selon qu''une condition est vraie ou fausse.',
   null, 'vrai', 'Syntaxe : =SI(test; valeur_si_vrai; valeur_si_faux). Fonction logique de base.', 1003, true),

  (d_id, n_deb, 'choix_multiple', 'Que va afficher la cellule B1 si elle contient =SOMME(A1:A5) et que A1:A5 contient les valeurs 10, 20, 30, vide, 40 ?',
   '[{"cle":"a","texte":"100"},{"cle":"b","texte":"50"},{"cle":"c","texte":"#VALEUR!"},{"cle":"d","texte":"0"}]'::jsonb,
   'a', 'SOMME ignore les cellules vides : 10+20+30+40 = 100.', 1004, true),

  -- INTERMÉDIAIRE (Excel - Mise à niveau)
  (d_id, n_int, 'choix_multiple', 'Vous avez écrit =A1*$B$1 en C1 et vous recopiez vers C10. Quelle référence change pendant la recopie ?',
   '[{"cle":"a","texte":"A1 devient A2, A3, ... mais $B$1 reste fixe"},{"cle":"b","texte":"Les deux références changent"},{"cle":"c","texte":"Aucune référence ne change"},{"cle":"d","texte":"Seule $B$1 change"}]'::jsonb,
   'a', 'Les $ figent la référence. C''est la base pour multiplier une plage par une constante en cellule.', 1005, true),

  (d_id, n_int, 'choix_multiple', 'Quelle fonction permet d''additionner uniquement les valeurs de B1:B100 dont la colonne A correspondante contient "Montréal" ?',
   '[{"cle":"a","texte":"=SOMME.SI(A1:A100;\"Montréal\";B1:B100)"},{"cle":"b","texte":"=SOMME(SI(A1:A100=\"Montréal\";B1:B100))"},{"cle":"c","texte":"=SI(A1:A100=\"Montréal\";SOMME(B1:B100))"},{"cle":"d","texte":"=SOMME(B1:B100;A1:A100=\"Montréal\")"}]'::jsonb,
   'a', 'SOMME.SI(plage_critère; critère; plage_à_additionner). Pour plusieurs critères, on passe à SOMME.SI.ENS.', 1006, true),

  (d_id, n_int, 'vrai_faux', 'La combinaison INDEX/EQUIV peut chercher une valeur à gauche d''une colonne de référence, contrairement à RECHERCHEV.',
   null, 'vrai', 'C''est l''un des principaux avantages enseignés : INDEX/EQUIV peut chercher dans n''importe quelle direction.', 1007, true),

  (d_id, n_int, 'formule', 'Vous voulez compter combien de cellules de B2:B500 contiennent une valeur supérieure à 1000. Écrivez la formule.',
   null, null, 'NB.SI ou COUNTIF avec critère ">1000".', 1008, true),

  -- AVANCÉ (Excel - Trucs de pro)
  (d_id, n_avc, 'choix_multiple', 'Vous avez 12 matrices identiques sur 12 feuilles (une par mois). Pour faire une recherche sur la feuille dont le nom est en A1, quelle approche utiliser ?',
   '[{"cle":"a","texte":"INDIRECT pour construire dynamiquement la référence de la plage cible"},{"cle":"b","texte":"RECHERCHEV imbriquée 12 fois avec SI"},{"cle":"c","texte":"Copier-coller toutes les feuilles en une seule grande matrice"},{"cle":"d","texte":"Ce n''est pas faisable sans VBA"}]'::jsonb,
   'a', 'INDIRECT(A1&"!Plage") permet de construire une référence dynamique vers la bonne feuille. C''est la signature des Trucs de pro.', 1009, true),

  (d_id, n_avc, 'choix_multiple', 'Quel est le rôle principal de la fonction OUX (XOR) ?',
   '[{"cle":"a","texte":"Retourne VRAI si une SEULE des conditions est vraie, mais pas les deux à la fois"},{"cle":"b","texte":"Combine OU et SI"},{"cle":"c","texte":"Compte le nombre de conditions vraies"},{"cle":"d","texte":"Convertit une condition booléenne en texte"}]'::jsonb,
   'a', 'Le « ou exclusif » est utile dans des cas comme « le client est admissible OU il a déjà payé, mais pas les deux ».', 1010, true),

  (d_id, n_avc, 'vrai_faux', 'Dans un tableau structuré nommé "Ventes" avec une colonne [Montant], on peut écrire =SOMME(Ventes[Montant]) et la formule s''ajustera automatiquement si on ajoute des lignes.',
   null, 'vrai', 'Référencer par nom de table et nom de colonne est l''une des grandes forces des tableaux structurés.', 1011, true),

  (d_id, n_avc, 'choix_multiple', 'Pour calculer un total cumulé qui se met à jour automatiquement quand on ajoute des lignes à un tableau structuré, la meilleure approche est :',
   '[{"cle":"a","texte":"Utiliser SOMME avec une référence mixte qui s''étend (ex : Ventes[[#En-têtes];[Montant]]:[@Montant])"},{"cle":"b","texte":"Écrire =A1+A2 répété manuellement"},{"cle":"c","texte":"Convertir le tableau en plage classique"},{"cle":"d","texte":"Ce n''est pas faisable dans un tableau structuré"}]'::jsonb,
   'a', 'Les références structurées avec [#En-têtes] et [@] permettent des cumuls dynamiques élégants.', 1012, true),

  -- EXPERT (Excel - Traitement, manipulation et analyse de données)
  (d_id, n_exp, 'choix_multiple', 'Quelle fonction permet d''ignorer les lignes masquées par un filtre lors d''une somme ?',
   '[{"cle":"a","texte":"SOUS.TOTAL avec le code 9 (ou 109 pour ignorer aussi les lignes manuellement masquées)"},{"cle":"b","texte":"SOMME tout simplement"},{"cle":"c","texte":"SOMMEPROD"},{"cle":"d","texte":"AGREGAT uniquement"}]'::jsonb,
   'a', 'SOUS.TOTAL et AGREGAT sont les deux fonctions qui respectent les filtres. AGREGAT est plus puissante (ignore aussi les erreurs).', 1013, true),

  (d_id, n_exp, 'choix_multiple', 'Pour calculer le nombre de jours ouvrés entre deux dates en excluant les fériés :',
   '[{"cle":"a","texte":"NB.JOURS.OUVRES(date_début; date_fin; plage_fériés)"},{"cle":"b","texte":"=date_fin - date_début"},{"cle":"c","texte":"=JOURS.OUVRES.INTL(... ; ... ; ...)"},{"cle":"d","texte":"=SOMMEPROD((dates>=A1)*(dates<=A2))"}]'::jsonb,
   'a', 'NB.JOURS.OUVRES(NETWORKDAYS) accepte un 3e argument optionnel pour les jours fériés à exclure.', 1014, true),

  (d_id, n_exp, 'vrai_faux', 'La fonction TENDANCE permet de calculer une projection linéaire à partir d''une série historique connue.',
   null, 'vrai', 'TENDANCE (TREND) ajuste une droite des moindres carrés et projette. Utile pour prévisions simples.', 1015, true),

  (d_id, n_exp, 'choix_multiple', 'Quelle fonction utiliser pour calculer une moyenne mobile sur 3 mois d''une plage A1:A24 ?',
   '[{"cle":"a","texte":"=MOYENNE(DECALER($A$1; LIGNE()-3; 0; 3; 1)) recopié vers le bas"},{"cle":"b","texte":"=MOYENNE(A1:A24)"},{"cle":"c","texte":"=TENDANCE(A1:A24)"},{"cle":"d","texte":"Excel n''offre pas cette fonctionnalité"}]'::jsonb,
   'a', 'DECALER crée une plage dynamique de 3 cellules. Combiné à MOYENNE, on a une moyenne mobile recopiable. Outil Analysis ToolPak offre aussi une commande dédiée.', 1016, true);
end $$;


-- ============================================================================
-- TABLEAUX CROISÉS DYNAMIQUES
-- Inspiré de : Mise à niveau (intro) / Tableaux de bord niveau 1/2/3
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='tableaux-croises-dynamiques';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT
  (d_id, n_deb, 'choix_multiple', 'Avant de créer un tableau croisé dynamique, vos données source doivent idéalement être organisées comment ?',
   '[{"cle":"a","texte":"Format tabulaire : une ligne d''en-têtes uniques, puis une ligne par observation"},{"cle":"b","texte":"Une cellule fusionnée par catégorie"},{"cle":"c","texte":"Triées par ordre alphabétique"},{"cle":"d","texte":"Avec une ligne de total à la fin"}]'::jsonb,
   'a', 'Format tabulaire = base de toute analyse. Les fusions, lignes de total et hiérarchies cassent les TCD.', 1101, true),

  (d_id, n_deb, 'choix_multiple', 'Pour qu''un TCD reflète l''ajout de nouvelles lignes dans la source, la meilleure pratique est :',
   '[{"cle":"a","texte":"Convertir la source en tableau Excel structuré (Ctrl+L) avant de créer le TCD"},{"cle":"b","texte":"Recréer le TCD à chaque fois"},{"cle":"c","texte":"Augmenter la plage manuellement à chaque actualisation"},{"cle":"d","texte":"Aucune solution n''existe nativement"}]'::jsonb,
   'a', 'Un tableau structuré s''étend automatiquement ; le TCD pointant dessus suit. Bonne pratique enseignée dès Mise à niveau.', 1102, true),

  (d_id, n_deb, 'vrai_faux', 'Dans un TCD, on peut afficher la même valeur avec plusieurs agrégations différentes (Somme, Moyenne, Compte…) côte à côte.',
   null, 'vrai', 'On glisse plusieurs fois le même champ dans Valeurs et on change l''agrégation de chacun.', 1103, true),

  (d_id, n_deb, 'choix_multiple', 'Pour rafraîchir un TCD quand la source a changé :',
   '[{"cle":"a","texte":"Clic droit sur le TCD → Actualiser (ou Ctrl+Alt+F5 pour tout actualiser)"},{"cle":"b","texte":"Le TCD se met à jour en temps réel"},{"cle":"c","texte":"Il faut supprimer et recréer le TCD"},{"cle":"d","texte":"Enregistrer puis rouvrir le fichier"}]'::jsonb,
   'a', 'Le rafraîchissement manuel (ou automatique à l''ouverture) est nécessaire car le TCD utilise un cache.', 1104, true),

  -- INTERMÉDIAIRE (Tableaux de bord niveau 1)
  (d_id, n_int, 'choix_multiple', 'Vous voulez optimiser les calculs d''un TCD utilisé comme moteur pour un tableau de bord. Quelle pratique recommandée ?',
   '[{"cle":"a","texte":"Désactiver les sous-totaux et totaux globaux quand ils ne sont pas nécessaires"},{"cle":"b","texte":"Toujours afficher tous les champs visibles pour clarté"},{"cle":"c","texte":"Multiplier les TCD identiques par feuille"},{"cle":"d","texte":"Ajouter des champs calculés à profusion"}]'::jsonb,
   'a', 'Moins de calculs = TCD plus rapide. Les sous-totaux peuvent fortement ralentir avec beaucoup de catégories.', 1105, true),

  (d_id, n_int, 'choix_multiple', 'Lorsqu''on construit un graphique pour un tableau de bord, le bon choix dépend principalement :',
   '[{"cle":"a","texte":"Du message à communiquer et du type de comparaison (évolution, composition, distribution, relation)"},{"cle":"b","texte":"De la couleur préférée du destinataire"},{"cle":"c","texte":"Du nombre de catégories à afficher uniquement"},{"cle":"d","texte":"D''utiliser systématiquement le type 3D pour l''impact"}]'::jsonb,
   'a', 'Chaque type de graphique répond à un message précis. Le 3D est généralement déconseillé car il déforme la perception.', 1106, true),

  (d_id, n_int, 'vrai_faux', 'On peut utiliser un TCD comme source d''un graphique dynamique qui se réactualise en même temps que le TCD.',
   null, 'vrai', 'C''est même le pattern de base d''un tableau de bord dans Excel.', 1107, true),

  (d_id, n_int, 'choix_multiple', 'Pour créer un TCD efficace destiné à un tableau de bord, il vaut mieux :',
   '[{"cle":"a","texte":"Désactiver l''ajustement automatique des largeurs de colonnes pour éviter que le tableau de bord se déforme à chaque actualisation"},{"cle":"b","texte":"Activer la mise en forme automatique à chaque actualisation"},{"cle":"c","texte":"Verrouiller toutes les cellules"},{"cle":"d","texte":"Cacher le TCD à l''utilisateur final"}]'::jsonb,
   'a', 'Options du TCD → Disposition et mise en forme → décocher « Ajuster automatiquement la largeur ».', 1108, true),

  -- AVANCÉ (Tableaux de bord niveau 2)
  (d_id, n_avc, 'choix_multiple', 'Vous voulez qu''un même segment (Slicer) filtre 3 TCD différents simultanément. Que faut-il ?',
   '[{"cle":"a","texte":"Que les 3 TCD partagent le même cache (même source) et connecter le segment aux 3 via Connexions de rapport"},{"cle":"b","texte":"Créer 3 segments identiques alignés"},{"cle":"c","texte":"Utiliser VBA"},{"cle":"d","texte":"Convertir tous les TCD en formules CUBE"}]'::jsonb,
   'a', 'Une seule source et Connexions de rapport (ou Connexions du segment) liées aux 3 TCD.', 1109, true),

  (d_id, n_avc, 'choix_multiple', 'Quel contrôle de formulaire permet de basculer entre plusieurs séries de données dans un graphique avec un seul choix exclusif ?',
   '[{"cle":"a","texte":"Les boutons d''option (radio) liés à une cellule"},{"cle":"b","texte":"Les cases à cocher"},{"cle":"c","texte":"Les zones de texte"},{"cle":"d","texte":"Le bouton-pression"}]'::jsonb,
   'a', 'Les boutons radio = choix exclusif. Combinés à CHOISIR/INDEX, ils alimentent dynamiquement un graphique.', 1110, true),

  (d_id, n_avc, 'vrai_faux', 'Les graphiques sparklines sont conçus pour afficher une mini-tendance temporelle directement dans une cellule, sans créer un graphique complet.',
   null, 'vrai', 'Excellents pour les tableaux de bord compacts. Disponibles en Courbe, Histogramme et Positif/Négatif.', 1111, true),

  (d_id, n_avc, 'choix_multiple', 'La mise en forme conditionnelle dans un TCD est particulièrement utile pour :',
   '[{"cle":"a","texte":"Faire ressortir les valeurs hors norme (top/flop, écarts par rapport à la cible)"},{"cle":"b","texte":"Augmenter la taille de la police"},{"cle":"c","texte":"Faire pivoter le TCD"},{"cle":"d","texte":"Ajouter des images"}]'::jsonb,
   'a', 'Échelles de couleur, jeux d''icônes et barres de données rendent les patterns visibles d''un coup d''œil.', 1112, true),

  -- EXPERT (Tableaux de bord niveau 3 + suite BI)
  (d_id, n_exp, 'choix_multiple', 'Pour un tableau de bord qui doit analyser plusieurs millions de lignes provenant de fichiers mensuels, l''approche optimale dans l''écosystème Excel est :',
   '[{"cle":"a","texte":"Power Query pour consolider + Power Pivot (modèle de données) pour analyser via TCD"},{"cle":"b","texte":"Copier-coller tous les fichiers dans une seule feuille"},{"cle":"c","texte":"Recréer 12 TCD séparés"},{"cle":"d","texte":"Convertir le tout en Access"}]'::jsonb,
   'a', 'PQ + PP est exactement la suite BI moderne enseignée par Le CFO Masqué.', 1113, true),

  (d_id, n_exp, 'choix_multiple', 'Vous voulez afficher dans une cellule un visuel personnalisé (genre badge KPI) qui change dynamiquement selon une valeur. Quelle technique enseignée par Le CFO Masqué peut le permettre ?',
   '[{"cle":"a","texte":"L''appareil photo d''Excel combiné à des plages nommées dynamiques"},{"cle":"b","texte":"Une zone de texte statique"},{"cle":"c","texte":"Un graphique 3D"},{"cle":"d","texte":"Insérer une image fixe"}]'::jsonb,
   'a', 'L''appareil photo (Camera Tool) projette une plage comme image vivante, modifiable via DECALER ou INDEX.', 1114, true),

  (d_id, n_exp, 'vrai_faux', 'Un TCD basé sur un modèle de données Power Pivot peut utiliser des mesures DAX comme CALCULATE, SUMX, etc., impossibles avec un TCD classique.',
   null, 'vrai', 'C''est l''un des avantages majeurs du modèle de données par rapport au TCD classique.', 1115, true),

  (d_id, n_exp, 'choix_multiple', 'Pour un tableau de bord interactif qui doit être consulté en mobilité par plusieurs collaborateurs, la solution Microsoft la mieux adaptée serait :',
   '[{"cle":"a","texte":"Power BI Service avec publication et application mobile"},{"cle":"b","texte":"Excel envoyé en pièce jointe"},{"cle":"c","texte":"Un PDF mis à jour manuellement"},{"cle":"d","texte":"Access partagé en réseau"}]'::jsonb,
   'a', 'Décision enseignée en formation TdB niveau 2 (suite BI) et Power BI niveau 1.', 1116, true);
end $$;


-- ============================================================================
-- MODÉLISATION FINANCIÈRE
-- Inspiré de : Mise à niveau / MF niveau 1/2/3
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='modelisation-financiere';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT
  (d_id, n_deb, 'choix_multiple', 'Dans un modèle financier, une cellule contenant une hypothèse modifiable par l''utilisateur devrait :',
   '[{"cle":"a","texte":"Être clairement identifiée visuellement (couleur de police différente, bordure, etc.) et isolée des cellules de calcul"},{"cle":"b","texte":"Contenir une formule complexe pour la robustesse"},{"cle":"c","texte":"Être verrouillée par défaut"},{"cle":"d","texte":"Être masquée"}]'::jsonb,
   'a', 'Convention universelle : une intrant = visuellement reconnaissable et isolé des calculs.', 1201, true),

  (d_id, n_deb, 'choix_multiple', 'La règle d''or de structuration d''un modèle financier enseignée chez Le CFO Masqué :',
   '[{"cle":"a","texte":"Séparer hypothèses, calculs et résultats sur des feuilles ou zones distinctes"},{"cle":"b","texte":"Tout regrouper en une seule feuille pour la simplicité"},{"cle":"c","texte":"Utiliser un maximum de couleurs et bordures"},{"cle":"d","texte":"Cacher les calculs intermédiaires"}]'::jsonb,
   'a', 'La séparation est la base de tout modèle auditable et maintenable.', 1202, true),

  (d_id, n_deb, 'vrai_faux', 'Un bon modèle financier évite les valeurs codées en dur (hardcoded) au milieu d''une formule.',
   null, 'vrai', 'Toute valeur d''entrée doit être isolée dans une cellule dédiée et clairement étiquetée.', 1203, true),

  (d_id, n_deb, 'choix_multiple', 'Le but principal d''un modèle financier est de :',
   '[{"cle":"a","texte":"Supporter la prise de décision en simulant des scénarios futurs"},{"cle":"b","texte":"Remplacer les états financiers officiels"},{"cle":"c","texte":"Archiver l''historique comptable"},{"cle":"d","texte":"Automatiser la comptabilité quotidienne"}]'::jsonb,
   'a', 'Outil d''aide à la décision, pas outil comptable.', 1204, true),

  -- INTERMÉDIAIRE (MF niveau 1)
  (d_id, n_int, 'choix_multiple', 'La technique de « l''interrupteur » enseignée en Modélisation financière (niveau 1) sert à :',
   '[{"cle":"a","texte":"Activer/désactiver une portion du modèle (ex : un projet) en multipliant ses flux par une cellule 0/1"},{"cle":"b","texte":"Allumer ou éteindre Excel"},{"cle":"c","texte":"Basculer entre versions de Windows"},{"cle":"d","texte":"Lier deux modèles entre eux"}]'::jsonb,
   'a', 'Technique de modélisation : un 1 active, un 0 désactive, propagé par multiplication dans les formules.', 1205, true),

  (d_id, n_int, 'choix_multiple', 'Pour analyser comment le profit varie selon 2 variables d''entrée (ex : prix unitaire et coût variable), l''outil Excel le plus adapté est :',
   '[{"cle":"a","texte":"Une table de données à 2 variables (Onglet Données → Analyse de scénarios → Table de données)"},{"cle":"b","texte":"Un graphique en aires"},{"cle":"c","texte":"La fonction SI imbriquée"},{"cle":"d","texte":"Power Query"}]'::jsonb,
   'a', 'Table de données = outil dédié pour explorer un résultat selon 1 ou 2 variables d''entrée.', 1206, true),

  (d_id, n_int, 'vrai_faux', 'Le gestionnaire de scénarios d''Excel permet d''enregistrer plusieurs jeux de valeurs d''hypothèses et de basculer rapidement entre eux.',
   null, 'vrai', 'Onglet Données → Analyse de scénarios → Gestionnaire de scénarios. Utile pour optimiste/pessimiste/réaliste.', 1207, true),

  (d_id, n_int, 'choix_multiple', 'Quelle fonction permet de générer dynamiquement une référence (ex : un nom d''onglet) à partir du contenu d''une cellule ?',
   '[{"cle":"a","texte":"INDIRECT"},{"cle":"b","texte":"DECALER"},{"cle":"c","texte":"EQUIV"},{"cle":"d","texte":"SI"}]'::jsonb,
   'a', 'INDIRECT(texte) convertit du texte en référence vivante. Pilier des modèles dynamiques.', 1208, true),

  -- AVANCÉ (MF niveau 2)
  (d_id, n_avc, 'choix_multiple', 'Dans un modèle 3-états financiers prévisionnels intégré, le pont entre le compte de résultat et le bilan se fait notamment via :',
   '[{"cle":"a","texte":"Le résultat net qui s''ajoute aux bénéfices non répartis du bilan d''ouverture"},{"cle":"b","texte":"Une simple addition de toutes les cellules"},{"cle":"c","texte":"Power Query"},{"cle":"d","texte":"Le gestionnaire de noms"}]'::jsonb,
   'a', 'C''est le lien fondamental : Résultat net → Capitaux propres → Bilan. Sans ce lien, le bilan ne balance pas.', 1209, true),

  (d_id, n_avc, 'choix_multiple', 'Pour modéliser des salaires avec gestion des nouvelles embauches et des départs en cours d''année, la meilleure approche est :',
   '[{"cle":"a","texte":"Avoir une liste détaillée des employés avec date de début/fin et calculer un prorata mensuel via SOMMEPROD ou des matrices conditionnelles"},{"cle":"b","texte":"Multiplier le nombre d''employés par un salaire moyen annuel"},{"cle":"c","texte":"Ne modéliser que les employés permanents"},{"cle":"d","texte":"Demander à RH une projection figée"}]'::jsonb,
   'a', 'Approche enseignée en MF niveau 2 : modélisation fine des entrées/sorties, prorata temporel par mois.', 1210, true),

  (d_id, n_avc, 'vrai_faux', 'Le Solveur Excel peut résoudre des problèmes d''optimisation avec plusieurs variables ET sous contraintes (égalités, inégalités, valeurs entières).',
   null, 'vrai', 'Outil → Solveur. Méthodes : Simplex (linéaire), GRG (non-linéaire), Evolutionary (combinatoire).', 1211, true),

  (d_id, n_avc, 'choix_multiple', 'Pour modéliser un amortissement linéaire dynamique qui tient compte d''acquisitions d''actifs étalées dans le temps :',
   '[{"cle":"a","texte":"Calculer mensuellement le solde net amortissable et l''amortissement à venir via des matrices de dates et SOMMEPROD"},{"cle":"b","texte":"Un seul amortissement annuel pour tout"},{"cle":"c","texte":"Ignorer les acquisitions en cours d''année"},{"cle":"d","texte":"Power Query est obligatoire"}]'::jsonb,
   'a', 'Approche enseignée en MF niveau 2 : matrice qui propage le coût d''un actif sur sa durée de vie à partir de sa date d''acquisition.', 1212, true),

  -- EXPERT (MF niveau 3)
  (d_id, n_exp, 'choix_multiple', 'Dans un modèle 3-statements complet (P&L + Bilan + Flux trésorerie), une référence circulaire INTENTIONNELLE peut surgir notamment pour :',
   '[{"cle":"a","texte":"Calculer l''intérêt sur la dette moyenne (qui dépend du résultat, qui dépend des intérêts...)"},{"cle":"b","texte":"Aucune raison légitime ; toute circularité est une erreur"},{"cle":"c","texte":"Décompter les jours fériés"},{"cle":"d","texte":"Formater les nombres"}]'::jsonb,
   'a', 'Cas classique enseigné : activer le calcul itératif (Options → Formules → Activer le calcul itératif).', 1213, true),

  (d_id, n_exp, 'choix_multiple', 'Le sommaire exécutif d''un modèle financier complet doit principalement :',
   '[{"cle":"a","texte":"Mettre en valeur les indicateurs les plus percutants (KPIs financiers, sensibilités majeures, conclusions)"},{"cle":"b","texte":"Reproduire intégralement les états financiers"},{"cle":"c","texte":"Contenir toutes les formules pour validation"},{"cle":"d","texte":"Être rédigé en anglais uniquement"}]'::jsonb,
   'a', 'Le sommaire est destiné aux décideurs : synthétique, visuel, focalisé sur ce qui pilote la décision.', 1214, true),

  (d_id, n_exp, 'vrai_faux', 'Un modèle financier robuste doit "balancer" (bilan équilibré, flux de trésorerie cohérent) même lorsqu''on change les hypothèses d''entrée.',
   null, 'vrai', 'Test ultime de l''intégrité du modèle. Une cellule de contrôle (différence Actif - Passif) doit toujours retourner 0.', 1215, true),

  (d_id, n_exp, 'choix_multiple', 'Pour valider qu''un modèle financier complet est intègre, l''une des techniques de contrôle les plus importantes est :',
   '[{"cle":"a","texte":"Ajouter des cellules de check qui doivent toujours retourner 0 ou VRAI (ex : Actif - Passif = 0, Flux net calculé = Variation de trésorerie au bilan)"},{"cle":"b","texte":"Le valider une seule fois à la livraison"},{"cle":"c","texte":"Compter le nombre de cellules contenant des formules"},{"cle":"d","texte":"Imprimer chaque feuille"}]'::jsonb,
   'a', 'Pratique enseignée en MF niveau 3 : checks visibles, idéalement avec mise en forme conditionnelle qui signale toute incohérence.', 1216, true);
end $$;


-- ============================================================================
-- VBA
-- Inspiré de : Initiation programmation / VBA niveau 1/2/3
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='vba';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT (Initiation à la programmation)
  (d_id, n_deb, 'choix_multiple', 'En programmation, une « variable » sert principalement à :',
   '[{"cle":"a","texte":"Stocker une valeur en mémoire qu''on peut réutiliser et modifier"},{"cle":"b","texte":"Démarrer un programme"},{"cle":"c","texte":"Imprimer un document"},{"cle":"d","texte":"Sauvegarder un fichier"}]'::jsonb,
   'a', 'Concept fondamental de toute initiation à la programmation.', 1301, true),

  (d_id, n_deb, 'choix_multiple', 'Une boucle (loop) en programmation sert à :',
   '[{"cle":"a","texte":"Répéter une série d''instructions plusieurs fois sans tout réécrire"},{"cle":"b","texte":"Décorer le code"},{"cle":"c","texte":"Annuler la dernière action"},{"cle":"d","texte":"Augmenter la mémoire disponible"}]'::jsonb,
   'a', 'For, While, Do... : essentiel pour traiter des collections ou répéter une logique.', 1302, true),

  (d_id, n_deb, 'vrai_faux', 'Une instruction conditionnelle (Si ... Alors ... Sinon) permet d''exécuter du code différemment selon une condition.',
   null, 'vrai', 'Brique de base : sans conditions, un programme est purement séquentiel.', 1303, true),

  (d_id, n_deb, 'choix_multiple', 'L''enregistreur de macros dans Excel sert à :',
   '[{"cle":"a","texte":"Générer automatiquement du code VBA correspondant aux actions effectuées dans Excel"},{"cle":"b","texte":"Compresser un classeur"},{"cle":"c","texte":"Sauvegarder le fichier"},{"cle":"d","texte":"Imprimer la macro"}]'::jsonb,
   'a', 'Excellent point d''entrée pour découvrir VBA : on enregistre, on observe le code généré, on l''adapte.', 1304, true),

  -- INTERMÉDIAIRE (VBA niveau 1)
  (d_id, n_int, 'choix_multiple', 'Pour déclarer une variable typée entier en VBA :',
   '[{"cle":"a","texte":"Dim i As Integer (ou As Long pour les très grands entiers)"},{"cle":"b","texte":"var i = 0"},{"cle":"c","texte":"int i;"},{"cle":"d","texte":"Let i = Integer"}]'::jsonb,
   'a', 'Dim + nom + As + type. Option Explicit force la déclaration de toutes les variables.', 1305, true),

  (d_id, n_int, 'choix_multiple', 'Quelle boucle VBA est la plus adaptée pour itérer sur toutes les feuilles d''un classeur ?',
   '[{"cle":"a","texte":"For Each ws In ThisWorkbook.Worksheets ... Next ws"},{"cle":"b","texte":"For i = 1 to 1000"},{"cle":"c","texte":"Do While True"},{"cle":"d","texte":"While Worksheets"}]'::jsonb,
   'a', 'For Each sur une collection est concis et sûr (pas besoin de compter manuellement).', 1306, true),

  (d_id, n_int, 'vrai_faux', 'L''instruction Application.ScreenUpdating = False fait gagner du temps d''exécution en empêchant Excel de rafraîchir l''affichage pendant la macro.',
   null, 'vrai', 'Une des optimisations les plus efficaces. Ne pas oublier de réactiver à la fin (= True).', 1307, true),

  (d_id, n_int, 'choix_multiple', 'Pour exécuter une macro pas à pas dans l''éditeur VBE, on utilise :',
   '[{"cle":"a","texte":"La touche F8"},{"cle":"b","texte":"La touche F5"},{"cle":"c","texte":"La touche F1"},{"cle":"d","texte":"Ctrl+S"}]'::jsonb,
   'a', 'F8 = pas à pas. F5 = exécuter complètement. F9 = poser un point d''arrêt sur la ligne courante.', 1308, true),

  -- AVANCÉ (VBA niveau 2)
  (d_id, n_avc, 'choix_multiple', 'Pour créer un formulaire personnalisé permettant à l''utilisateur de saisir des données dans une fenêtre dédiée :',
   '[{"cle":"a","texte":"Insérer un UserForm dans l''éditeur VBE, y placer des contrôles (TextBox, ComboBox...) et écrire le code des événements"},{"cle":"b","texte":"Utiliser uniquement MsgBox"},{"cle":"c","texte":"Créer une feuille Excel cachée"},{"cle":"d","texte":"Power Apps est obligatoire"}]'::jsonb,
   'a', 'UserForm = composant clé du niveau 2 pour créer des applications conviviales.', 1309, true),

  (d_id, n_avc, 'choix_multiple', 'Pour gérer les erreurs runtime en VBA de manière contrôlée :',
   '[{"cle":"a","texte":"On Error Goto Gestion (étiquette) puis bloc de gestion avant Exit Sub"},{"cle":"b","texte":"Ignorer les erreurs en permanence avec On Error Resume Next sans jamais le réactiver"},{"cle":"c","texte":"Compter sur Excel pour les gérer automatiquement"},{"cle":"d","texte":"Mettre toutes les variables en Variant"}]'::jsonb,
   'a', 'Gestionnaire d''erreurs structuré : étiquette de gestion + Exit Sub + Resume si on veut reprendre.', 1310, true),

  (d_id, n_avc, 'vrai_faux', 'On peut envoyer automatiquement un courriel depuis une macro VBA Excel en pilotant Outlook via Automation COM.',
   null, 'vrai', 'CreateObject("Outlook.Application") puis créer un MailItem. Couvert au niveau 2.', 1311, true),

  (d_id, n_avc, 'choix_multiple', 'Pour exporter une feuille active vers un fichier PDF via VBA :',
   '[{"cle":"a","texte":"ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=\"...\""},{"cle":"b","texte":"Application.PrintOut"},{"cle":"c","texte":"Workbook.SaveAs xlsm"},{"cle":"d","texte":"VBA ne supporte pas l''export PDF"}]'::jsonb,
   'a', 'Méthode standard ; option Quality pour résolution, OpenAfterPublish:=False/True.', 1312, true),

  -- EXPERT (VBA niveau 3)
  (d_id, n_exp, 'choix_multiple', 'Dans un outil de facturation VBA complet, la meilleure pratique pour stocker l''historique des factures est :',
   '[{"cle":"a","texte":"Une feuille « Base de données » dédiée, alimentée par ajout en bas, qui sert de référence à tous les formulaires de consultation"},{"cle":"b","texte":"Créer un nouveau classeur par facture"},{"cle":"c","texte":"Sauvegarder uniquement les PDF générés"},{"cle":"d","texte":"Tout garder en mémoire vive sans persistance"}]'::jsonb,
   'a', 'Pattern enseigné en VBA niveau 3 : une feuille BD interne fait office de table relationnelle.', 1313, true),

  (d_id, n_exp, 'choix_multiple', 'Pour rappeler une facture spécifique à l''écran via un formulaire de recherche, l''approche optimale est :',
   '[{"cle":"a","texte":"Une ComboBox affichant les numéros de facture (ou clients), et un événement Change qui peuple les autres champs depuis la base de données"},{"cle":"b","texte":"Demander à l''utilisateur de taper le numéro exact à chaque fois"},{"cle":"c","texte":"Ouvrir un nouveau fichier par facture"},{"cle":"d","texte":"Imprimer la base et chercher manuellement"}]'::jsonb,
   'a', 'Pattern enseigné : ComboBox + événement Change + recherche dans la base (Find ou Match).', 1314, true),

  (d_id, n_exp, 'vrai_faux', 'Une macro qui parcourt et écrit dans 100 000 cellules une à une sera dramatiquement plus lente que la même logique appliquée en chargeant les données dans une matrice Variant en mémoire, puis en écrivant le tableau d''un coup.',
   null, 'vrai', 'Optimisation cruciale : les accès cellule par cellule sont coûteux ; la matrice Variant est ~100x plus rapide.', 1315, true),

  (d_id, n_exp, 'choix_multiple', 'Pour envoyer automatiquement des rappels par courriel aux clients dont la facture est en retard de plus de 30 jours :',
   '[{"cle":"a","texte":"Boucler sur la base des comptes à recevoir, filtrer ceux > 30 jours, créer un MailItem Outlook par client avec un corps personnalisé"},{"cle":"b","texte":"Envoyer un seul courriel à tous les clients"},{"cle":"c","texte":"Imprimer la liste et appeler chaque client"},{"cle":"d","texte":"Ce processus ne peut pas être automatisé en VBA"}]'::jsonb,
   'a', 'Workflow phare du VBA niveau 3 : combinaison gestion de BD + filtre + envoi automatisé.', 1316, true);
end $$;


-- ============================================================================
-- POWER QUERY
-- Inspiré de : Intro Power Query + langage M / Allez plus loin avec PQ
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='power-query';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT
  (d_id, n_deb, 'choix_multiple', 'Power Query (Récupérer et Transformer) est principalement utilisé pour :',
   '[{"cle":"a","texte":"Importer, nettoyer, transformer et combiner des données provenant de sources variées, de manière automatisée et rafraîchissable"},{"cle":"b","texte":"Créer des graphiques 3D"},{"cle":"c","texte":"Sécuriser un fichier Excel"},{"cle":"d","texte":"Imprimer plusieurs feuilles en un clic"}]'::jsonb,
   'a', 'C''est l''outil ETL (Extract-Transform-Load) intégré à Excel et Power BI. « Game changer » selon Le CFO Masqué.', 1401, true),

  (d_id, n_deb, 'choix_multiple', 'Pour ouvrir l''éditeur Power Query depuis Excel :',
   '[{"cle":"a","texte":"Onglet Données → Obtenir et transformer des données → choisir une source ou lancer l''éditeur"},{"cle":"b","texte":"Onglet Insertion → TCD"},{"cle":"c","texte":"Fichier → Options → Compléments"},{"cle":"d","texte":"Onglet Formules → Audit"}]'::jsonb,
   'a', 'Onglet Données est l''accès principal. Dans les versions récentes, plus besoin de compléments à installer.', 1402, true),

  (d_id, n_deb, 'vrai_faux', 'Chaque étape de transformation dans Power Query est enregistrée dans une liste à droite, qu''on peut réordonner ou supprimer après coup.',
   null, 'vrai', 'Cette journalisation des étapes rend les requêtes auditables et maintenables.', 1403, true),

  (d_id, n_deb, 'choix_multiple', 'Pour combiner verticalement (empiler les lignes) deux requêtes ayant la même structure :',
   '[{"cle":"a","texte":"Ajouter (Append) des requêtes"},{"cle":"b","texte":"Fusionner (Merge) des requêtes"},{"cle":"c","texte":"Pivoter une colonne"},{"cle":"d","texte":"Regrouper par"}]'::jsonb,
   'a', 'Append = concaténation verticale. Merge = jointure (horizontale).', 1404, true),

  -- INTERMÉDIAIRE (Intro PQ et langage M)
  (d_id, n_int, 'choix_multiple', 'La consolidation automatique de plusieurs fichiers Excel (ex : ventes mensuelles) dans un dossier se fait avec :',
   '[{"cle":"a","texte":"Obtenir des données → À partir d''un fichier → À partir d''un dossier"},{"cle":"b","texte":"Copier-coller chaque fichier manuellement"},{"cle":"c","texte":"VBA est obligatoire"},{"cle":"d","texte":"Power Pivot uniquement"}]'::jsonb,
   'a', 'Power Query peut traiter un dossier complet et appliquer la même transformation à chaque fichier.', 1405, true),

  (d_id, n_int, 'choix_multiple', 'L''opération « Dépivoter les colonnes » (Unpivot) sert à :',
   '[{"cle":"a","texte":"Transformer un tableau « large » (une colonne par mois) en tableau « long » (une ligne par mois et par catégorie)"},{"cle":"b","texte":"Inverser les lignes et colonnes (transposer)"},{"cle":"c","texte":"Supprimer les doublons"},{"cle":"d","texte":"Trier les colonnes alphabétiquement"}]'::jsonb,
   'a', 'Opération essentielle pour préparer des données à l''analyse avec TCD ou Power Pivot.', 1406, true),

  (d_id, n_int, 'vrai_faux', 'On peut créer une fonction personnalisée en langage M qui prend des paramètres et l''invoquer ligne par ligne sur une table.',
   null, 'vrai', 'Syntaxe : (param1, param2) => let ... in ... Excellent pour factoriser des transformations répétitives.', 1407, true),

  (d_id, n_int, 'choix_multiple', 'Pour ajouter une colonne calculée qui dépend du contenu d''une autre colonne ligne par ligne :',
   '[{"cle":"a","texte":"Ajouter une colonne → Colonne personnalisée, et utiliser le langage M"},{"cle":"b","texte":"Modifier directement chaque cellule à la main"},{"cle":"c","texte":"Ce n''est pas faisable en Power Query"},{"cle":"d","texte":"Il faut basculer en VBA"}]'::jsonb,
   'a', 'Colonne personnalisée + formule M = équivalent d''un IF/SOMME/CONCAT classique.', 1408, true),

  -- AVANCÉ (Allez plus loin avec PQ)
  (d_id, n_avc, 'choix_multiple', 'Pour traiter des données NON structurées (ex : un rapport texte fixe sans tableau clair) avec Power Query :',
   '[{"cle":"a","texte":"Combiner Text.Split, Text.BetweenDelimiters, indices de colonnes et étapes de pivot/dépivot pour reconstruire un format tabulaire"},{"cle":"b","texte":"Convertir manuellement le rapport en Excel"},{"cle":"c","texte":"Power Query ne supporte pas le non-structuré"},{"cle":"d","texte":"Demander la source en CSV uniquement"}]'::jsonb,
   'a', 'Approche enseignée dans « Allez plus loin avec PQ » : composer des fonctions M pour reconstituer la structure.', 1409, true),

  (d_id, n_avc, 'choix_multiple', 'Le query folding consiste à :',
   '[{"cle":"a","texte":"Faire exécuter les transformations directement par la source (ex : SQL Server) plutôt qu''en local, pour la performance"},{"cle":"b","texte":"Replier visuellement le code M dans l''éditeur"},{"cle":"c","texte":"Compresser le fichier source"},{"cle":"d","texte":"Diviser une requête en plusieurs"}]'::jsonb,
   'a', 'Quand le folding casse (étape non-supportée), Power Query télécharge tout et traite en local. Surveiller via « Afficher la requête native ».', 1410, true),

  (d_id, n_avc, 'vrai_faux', 'Power Query permet d''importer des données depuis une page web (web scraping) en analysant les tables HTML.',
   null, 'vrai', 'À partir du web → coller URL. Web.Page + Web.Contents donnent accès au DOM.', 1411, true),

  (d_id, n_avc, 'choix_multiple', 'Pour appeler une API REST avec un jeton d''authentification dans Power Query :',
   '[{"cle":"a","texte":"Web.Contents(url, [Headers=[Authorization=\"Bearer \" & token]])"},{"cle":"b","texte":"Power Query ne supporte pas les API"},{"cle":"c","texte":"Il faut obligatoirement passer par VBA"},{"cle":"d","texte":"Convertir l''API en fichier CSV manuellement"}]'::jsonb,
   'a', 'Web.Contents accepte un record d''options avec Headers, RelativePath, Query, etc.', 1412, true),

  -- EXPERT (Maîtrise M avancée)
  (d_id, n_exp, 'choix_multiple', 'List.Generate en M permet de :',
   '[{"cle":"a","texte":"Créer une liste itérative à partir d''une fonction d''initialisation, condition d''arrêt et itération (équivalent d''une boucle)"},{"cle":"b","texte":"Copier une liste"},{"cle":"c","texte":"Convertir une liste en table"},{"cle":"d","texte":"Supprimer des doublons"}]'::jsonb,
   'a', 'Permet des constructions complexes : simulations, calculs cumulés conditionnels, générations de calendriers.', 1413, true),

  (d_id, n_exp, 'choix_multiple', 'Pour rendre une requête Power Query rapide sur une grande source SQL :',
   '[{"cle":"a","texte":"Maintenir le query folding : filtrer, supprimer des colonnes, joindre AVANT toute transformation non-foldable (ex : ajout de colonne avec fonction custom)"},{"cle":"b","texte":"Ajouter le plus d''étapes possible pour la lisibilité"},{"cle":"c","texte":"Travailler en mode DirectQuery pour tout"},{"cle":"d","texte":"Désactiver l''actualisation automatique"}]'::jsonb,
   'a', 'Une étape qui casse le folding fait télécharger toute la table. Repousser les transformations custom le plus tard possible.', 1414, true),

  (d_id, n_exp, 'vrai_faux', 'En langage M, il est possible de créer des fonctions récursives en référençant la fonction elle-même via le mot-clé @.',
   null, 'vrai', 'Ex : functionName = (x) => if x <= 1 then 1 else x * @functionName(x-1). Utile pour traverser des structures hiérarchiques.', 1415, true),

  (d_id, n_exp, 'choix_multiple', 'Pour gérer dynamiquement des paramètres (chemin de fichier, date de filtre, etc.) sans modifier le code M à chaque exécution :',
   '[{"cle":"a","texte":"Utiliser les Paramètres de requête (Accueil → Gérer les paramètres) et y faire référence dans les étapes"},{"cle":"b","texte":"Coder en dur la valeur dans le code M"},{"cle":"c","texte":"Demander à l''utilisateur à chaque actualisation"},{"cle":"d","texte":"Ce n''est pas faisable"}]'::jsonb,
   'a', 'Les paramètres rendent les requêtes portables et facilement maintenables.', 1416, true);
end $$;


-- ============================================================================
-- POWER PIVOT
-- Inspiré de : Intro Power Pivot / DAX
-- ============================================================================
do $$
declare d_id uuid; n_deb uuid; n_int uuid; n_avc uuid; n_exp uuid;
begin
  select id into d_id  from public.domaines where slug='power-pivot';
  select id into n_deb from public.niveaux where slug='debutant';
  select id into n_int from public.niveaux where slug='intermediaire';
  select id into n_avc from public.niveaux where slug='avance';
  select id into n_exp from public.niveaux where slug='expert';

  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- DÉBUTANT
  (d_id, n_deb, 'choix_multiple', 'Power Pivot permet de :',
   '[{"cle":"a","texte":"Construire un modèle de données multi-tables capable d''analyser des centaines de millions de lignes via TCD"},{"cle":"b","texte":"Convertir Excel en Power BI"},{"cle":"c","texte":"Créer des graphiques 3D"},{"cle":"d","texte":"Compresser un fichier Excel"}]'::jsonb,
   'a', 'Moteur columnstore VertiPaq + langage DAX. Limite : la RAM, pas le format de feuille.', 1501, true),

  (d_id, n_deb, 'choix_multiple', 'Pour analyser ensemble une table « Ventes » et une table « Clients » dans Power Pivot, il faut :',
   '[{"cle":"a","texte":"Créer une relation entre une colonne commune (ex : ID_Client) des deux tables"},{"cle":"b","texte":"Fusionner les deux tables manuellement avec RECHERCHEV"},{"cle":"c","texte":"Mettre toutes les colonnes des deux tables dans une seule"},{"cle":"d","texte":"Tout convertir en TCD séparé"}]'::jsonb,
   'a', 'Pilier du modèle de données : relations 1:N entre table de faits et tables de dimensions.', 1502, true),

  (d_id, n_deb, 'vrai_faux', 'Le modèle de données Power Pivot accepte beaucoup plus que les 1 048 576 lignes d''une feuille Excel classique.',
   null, 'vrai', 'Avec compression colonnaire VertiPaq, on peut analyser des centaines de millions de lignes.', 1503, true),

  (d_id, n_deb, 'choix_multiple', 'Une mesure DAX simple pour totaliser la colonne Montant de la table Ventes s''écrit :',
   '[{"cle":"a","texte":"Total Ventes := SUM(Ventes[Montant])"},{"cle":"b","texte":"Total Ventes := SOMME(A1:A10)"},{"cle":"c","texte":"Total Ventes := SUMIF()"},{"cle":"d","texte":"=Ventes!Montant"}]'::jsonb,
   'a', 'Syntaxe DAX : NomMesure := EXPRESSION. Référencer Table[Colonne], pas une plage cellulaire.', 1504, true),

  -- INTERMÉDIAIRE (Intro Power Pivot)
  (d_id, n_int, 'choix_multiple', 'Un schéma en étoile en modélisation de données consiste à :',
   '[{"cle":"a","texte":"Une table de faits centrale entourée de tables de dimensions reliées par des clés"},{"cle":"b","texte":"Une seule grande table contenant tout"},{"cle":"c","texte":"Des tables liées en cascade séquentielle"},{"cle":"d","texte":"Un modèle réservé à Power BI"}]'::jsonb,
   'a', 'Modèle de prédilection pour la performance et la clarté. Enseigné dès l''Intro Power Pivot.', 1505, true),

  (d_id, n_int, 'choix_multiple', 'La différence essentielle entre une colonne calculée et une mesure en DAX :',
   '[{"cle":"a","texte":"Colonne calculée = évaluée à l''actualisation, stockée en mémoire. Mesure = évaluée à la volée selon le contexte de filtre du visuel."},{"cle":"b","texte":"Aucune différence"},{"cle":"c","texte":"Mesure = obligatoire ; colonne = optionnelle"},{"cle":"d","texte":"Mesure = plus lente que colonne calculée"}]'::jsonb,
   'a', 'Principe fondamental : préférer une mesure quand possible, plus flexible et économe en mémoire.', 1506, true),

  (d_id, n_int, 'vrai_faux', 'Une table calendrier dédiée (Date Table) est fortement recommandée pour utiliser efficacement les fonctions de time intelligence DAX.',
   null, 'vrai', 'YTD, YoY, MTD et compagnie reposent toutes sur une table de dates marquée comme telle.', 1507, true),

  (d_id, n_int, 'choix_multiple', 'Pour exploiter une mesure Power Pivot dans Excel SANS passer par un TCD classique :',
   '[{"cle":"a","texte":"Utiliser les fonctions cube d''Excel (CUBEVALEUR, CUBEMEMBRE, CUBEENSEMBLE...)"},{"cle":"b","texte":"Recopier la valeur manuellement"},{"cle":"c","texte":"Ce n''est pas possible"},{"cle":"d","texte":"Convertir le modèle en VBA"}]'::jsonb,
   'a', 'Les fonctions cube permettent de mettre une mesure DAX dans n''importe quelle cellule, idéal pour les tableaux de bord libres.', 1508, true),

  -- AVANCÉ (Introduction au langage DAX)
  (d_id, n_avc, 'choix_multiple', 'Le contexte de lignes (row context) en DAX existe principalement dans :',
   '[{"cle":"a","texte":"Les colonnes calculées et les fonctions itératives (SUMX, FILTER, ADDCOLUMNS...)"},{"cle":"b","texte":"Toutes les mesures par défaut"},{"cle":"c","texte":"Uniquement avec CALCULATE"},{"cle":"d","texte":"Dans les TCD seulement"}]'::jsonb,
   'a', 'Mesures = contexte de filtre. Colonnes calculées + itérateurs = contexte de lignes.', 1509, true),

  (d_id, n_avc, 'choix_multiple', 'La fonction CALCULATE en DAX permet :',
   '[{"cle":"a","texte":"D''évaluer une expression en modifiant le contexte de filtre courant (ajout, suppression, remplacement)"},{"cle":"b","texte":"De calculer une formule Excel classique"},{"cle":"c","texte":"De convertir une mesure en colonne"},{"cle":"d","texte":"De copier une formule"}]'::jsonb,
   'a', 'LA fonction centrale de DAX. Permet aussi la transition de contexte (ligne → filtre).', 1510, true),

  (d_id, n_avc, 'vrai_faux', 'RELATED en DAX permet, depuis une table de faits, de récupérer une valeur d''une table de dimension liée via une relation active.',
   null, 'vrai', 'Ex : RELATED(Clients[Région]) dans une colonne calculée de la table Ventes.', 1511, true),

  (d_id, n_avc, 'choix_multiple', 'Pour calculer un total Year-To-Date des ventes :',
   '[{"cle":"a","texte":"YTD Ventes := TOTALYTD(SUM(Ventes[Montant]); ''Calendrier''[Date])"},{"cle":"b","texte":"YTD Ventes := SUMYTD()"},{"cle":"c","texte":"Faire un TCD classique uniquement"},{"cle":"d","texte":"Ce n''est pas faisable en DAX"}]'::jsonb,
   'a', 'TOTALYTD est la fonction de time intelligence dédiée. Nécessite une table calendrier marquée.', 1512, true),

  -- EXPERT (DAX maîtrise + calendriers fiscaux/4-4-5)
  (d_id, n_exp, 'choix_multiple', 'La transition de contexte (context transition) en DAX :',
   '[{"cle":"a","texte":"Convertit un contexte de ligne en contexte de filtre, déclenchée par CALCULATE (ou les mesures, qui contiennent un CALCULATE implicite)"},{"cle":"b","texte":"Change la langue du modèle"},{"cle":"c","texte":"Bascule entre Import et DirectQuery"},{"cle":"d","texte":"Désactive une relation"}]'::jsonb,
   'a', 'Concept fondamental pour comprendre pourquoi SUMX(Table; [Mesure]) fonctionne « comme par magie ».', 1513, true),

  (d_id, n_exp, 'choix_multiple', 'Pour utiliser un calendrier fiscal qui commence le 1er avril plutôt qu''au 1er janvier dans la time intelligence :',
   '[{"cle":"a","texte":"Passer le paramètre optionnel de fin d''année fiscale aux fonctions (ex : DATESYTD(Calendrier[Date]; \"31/03\"))"},{"cle":"b","texte":"DAX ne supporte que l''année civile"},{"cle":"c","texte":"Réécrire toutes les dates manuellement"},{"cle":"d","texte":"Convertir en Power BI obligatoirement"}]'::jsonb,
   'a', 'Beaucoup de fonctions YTD/DATESYTD/SAMEPERIODLASTYEAR acceptent un paramètre de fin d''année.', 1514, true),

  (d_id, n_exp, 'vrai_faux', 'USERELATIONSHIP active une relation inactive le temps d''un CALCULATE — utile quand on a plusieurs relations entre deux tables (ex : date commande et date livraison).',
   null, 'vrai', 'Pattern essentiel pour les modèles avec rôle multiple d''une dimension date.', 1515, true),

  (d_id, n_exp, 'choix_multiple', 'Pour optimiser une mesure DAX qui calcule un cumul complexe sur des millions de lignes :',
   '[{"cle":"a","texte":"Utiliser des variables VAR pour éviter les recalculs, simplifier les itérateurs, et envisager une colonne calculée si l''agrégat ne dépend pas du contexte"},{"cle":"b","texte":"Les itérateurs sont toujours optimaux, rien à faire"},{"cle":"c","texte":"Tout déplacer en Power Query"},{"cle":"d","texte":"Ajouter des relations bidirectionnelles partout"}]'::jsonb,
   'a', 'VAR cache un résultat intermédiaire et améliore lisibilité ET performance. À combiner avec un schéma en étoile bien pensé.', 1516, true);
end $$;
