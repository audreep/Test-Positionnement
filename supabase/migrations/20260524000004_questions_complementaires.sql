-- =============================================================================
-- Migration 004 - Banque de questions complémentaires (Phase 1 +)
--
-- 96 questions générées automatiquement (4 par niveau × 4 niveaux × 6 domaines).
-- À réviser/modifier ensuite via l'interface admin /admin/questions.
--
-- Niveaux : Débutant, Intermédiaire, Avancé, Expert
-- Domaines : Formules, TCD, Modélisation fin., VBA, Power Query, Power Pivot
-- =============================================================================

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

  -- ==========================================================================
  -- FORMULES
  -- ==========================================================================
  insert into public.questions (domaine_id, niveau_id, type, enonce, options, bonne_reponse, explication, ordre, actif) values

  -- Débutant
  (d_form, n_deb, 'choix_multiple', 'Quelle formule additionne correctement les valeurs de A1 à A10 ?',
   '[{"cle":"a","texte":"=SOMME(A1:A10)"},{"cle":"b","texte":"=ADDITION(A1:A10)"},{"cle":"c","texte":"=SUM(A1+A10)"},{"cle":"d","texte":"=A1+A10"}]'::jsonb,
   'a', 'SOMME est la fonction d''agrégation de base en français.', 101, true),

  (d_form, n_deb, 'choix_multiple', 'Pour figer une référence dans une formule afin qu''elle ne change pas lors d''une recopie, on utilise :',
   '[{"cle":"a","texte":"Le symbole $"},{"cle":"b","texte":"Le symbole #"},{"cle":"c","texte":"Le symbole &"},{"cle":"d","texte":"Le symbole @"}]'::jsonb,
   'a', 'Référence absolue avec $A$1.', 102, true),

  (d_form, n_deb, 'vrai_faux', 'La fonction MOYENNE ignore automatiquement les cellules vides dans la plage.',
   null, 'vrai', 'Les cellules vides sont ignorées, contrairement aux zéros qui sont comptés.', 103, true),

  (d_form, n_deb, 'choix_multiple', 'Quelle est la différence entre =SOMME(A1:A5) et =A1+A2+A3+A4+A5 ?',
   '[{"cle":"a","texte":"Aucune au niveau du résultat, mais SOMME est plus robuste si on insère des lignes"},{"cle":"b","texte":"SOMME est plus lente"},{"cle":"c","texte":"L''addition manuelle gère mieux les erreurs"},{"cle":"d","texte":"SOMME ne fonctionne pas au-delà de 3 cellules"}]'::jsonb,
   'a', 'SOMME(A1:A5) s''ajustera automatiquement si on insère une ligne dans la plage.', 104, true),

  -- Intermédiaire
  (d_form, n_int, 'choix_multiple', 'Quelle fonction utiliser pour chercher une valeur dans la première colonne d''un tableau et retourner une valeur d''une autre colonne du même tableau ?',
   '[{"cle":"a","texte":"RECHERCHEV"},{"cle":"b","texte":"RECHERCHE"},{"cle":"c","texte":"INDEX seule"},{"cle":"d","texte":"SOMME.SI"}]'::jsonb,
   'a', 'RECHERCHEV (VLOOKUP) est la fonction historique de recherche verticale.', 105, true),

  (d_form, n_int, 'choix_multiple', '=SI(A1>10;"Grand";"Petit") retourne quelle valeur si A1=10 ?',
   '[{"cle":"a","texte":"Grand"},{"cle":"b","texte":"Petit"},{"cle":"c","texte":"#VALEUR!"},{"cle":"d","texte":"FAUX"}]'::jsonb,
   'b', 'La condition est strict (>), pas >=. Pour A1=10, la condition est fausse.', 106, true),

  (d_form, n_int, 'vrai_faux', 'La fonction NB.SI compte les cellules d''une plage qui répondent à un critère donné.',
   null, 'vrai', 'NB.SI(plage; critère) retourne un compte.', 107, true),

  (d_form, n_int, 'formule', 'Écrivez une formule qui compte le nombre de cellules dans A1:A100 contenant exactement le texte "Oui".',
   null, null, 'NB.SI ou COUNTIF avec critère exact entre guillemets.', 108, true),

  -- Avancé
  (d_form, n_avc, 'choix_multiple', 'La combinaison INDEX/EQUIV est souvent préférée à RECHERCHEV principalement parce qu''elle :',
   '[{"cle":"a","texte":"Permet la recherche dans n''importe quelle direction (gauche/droite) et est plus performante"},{"cle":"b","texte":"Est compatible avec Excel 2003"},{"cle":"c","texte":"Ne nécessite pas de référence absolue"},{"cle":"d","texte":"Peut chercher dans plusieurs feuilles simultanément"}]'::jsonb,
   'a', 'INDEX/EQUIV (INDEX/MATCH) fonctionne dans toutes les directions et survit aux insertions de colonnes.', 109, true),

  (d_form, n_avc, 'choix_multiple', 'Que calcule la fonction SOMMEPROD(A1:A10;B1:B10) ?',
   '[{"cle":"a","texte":"La somme des produits deux à deux : A1*B1 + A2*B2 + ... + A10*B10"},{"cle":"b","texte":"La somme cumulée des deux plages"},{"cle":"c","texte":"Le produit de la somme des deux plages"},{"cle":"d","texte":"Une erreur, la syntaxe est invalide"}]'::jsonb,
   'a', 'SOMMEPROD est très utilisée pour des sommes pondérées ou conditionnelles avancées.', 110, true),

  (d_form, n_avc, 'vrai_faux', 'La fonction INDIRECT permet de construire dynamiquement une référence à partir d''une chaîne de texte.',
   null, 'vrai', 'Utile pour des références basées sur le contenu d''une cellule.', 111, true),

  (d_form, n_avc, 'choix_multiple', 'Pour calculer un total cumulé en B1:B10 à partir des valeurs de A1:A10 :',
   '[{"cle":"a","texte":"En B1 : =SOMME($A$1:A1) puis recopier vers le bas"},{"cle":"b","texte":"=SOMME(A:A) dans chaque cellule"},{"cle":"c","texte":"=A1+A2 répété dans chaque cellule"},{"cle":"d","texte":"Cela nécessite obligatoirement du VBA"}]'::jsonb,
   'a', 'Le mélange référence absolue/relative crée une plage qui s''étend à la recopie.', 112, true),

  -- Expert
  (d_form, n_exp, 'choix_multiple', 'La fonction LAMBDA (Excel 365) permet de :',
   '[{"cle":"a","texte":"Créer des fonctions personnalisées réutilisables sans recourir à VBA"},{"cle":"b","texte":"Enregistrer des macros automatiquement"},{"cle":"c","texte":"Convertir des formules en code Python"},{"cle":"d","texte":"Optimiser les calculs matriciels uniquement"}]'::jsonb,
   'a', 'LAMBDA + Gestionnaire de noms = fonctions personnalisées natives.', 113, true),

  (d_form, n_exp, 'choix_multiple', 'Le débordement (spill) en Excel 365 produit :',
   '[{"cle":"a","texte":"Un résultat qui se répand dans plusieurs cellules à partir d''une seule formule"},{"cle":"b","texte":"Une erreur #DEBORDEMENT systématiquement"},{"cle":"c","texte":"Le résultat dans la cellule active uniquement"},{"cle":"d","texte":"Un simple message d''avertissement"}]'::jsonb,
   'a', 'Les formules dynamiques comme UNIQUE, FILTRE, TRIER débordent naturellement.', 114, true),

  (d_form, n_exp, 'vrai_faux', 'La fonction LET améliore la lisibilité en permettant de nommer des sous-expressions au sein d''une formule.',
   null, 'vrai', 'LET(nom; expr; ... ; résultat) évite les répétitions et clarifie le code.', 115, true),

  (d_form, n_exp, 'choix_multiple', 'Pour extraire les valeurs uniques d''une plage en Excel 365 :',
   '[{"cle":"a","texte":"=UNIQUE(plage)"},{"cle":"b","texte":"=DISTINCT(plage)"},{"cle":"c","texte":"=FILTRE(plage)"},{"cle":"d","texte":"=TRIER(plage)"}]'::jsonb,
   'a', 'UNIQUE retourne les valeurs distinctes, souvent combinée avec TRIER.', 116, true);

  -- Mise à jour de la regex de la question formule
  update public.questions
    set regex_acceptees = '["^=NB\\.SI\\(A1:A100;\\s*\"\"Oui\"\"\\)$", "^=COUNTIF\\(A1:A100,\\s*\"\"Oui\"\"\\)$"]'::jsonb
    where ordre = 108 and domaine_id = d_form and niveau_id = n_int;

end $$;


-- ============================================================================
-- TABLEAUX CROISÉS DYNAMIQUES
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

  -- Débutant
  (d_id, n_deb, 'choix_multiple', 'Pour créer un TCD, les données source doivent idéalement :',
   '[{"cle":"a","texte":"Être organisées en colonnes avec des en-têtes uniques"},{"cle":"b","texte":"Contenir au moins 1000 lignes"},{"cle":"c","texte":"Être triées par ordre alphabétique"},{"cle":"d","texte":"Ne contenir aucune cellule vide"}]'::jsonb,
   'a', 'Les TCD attendent un format dit "tabulaire" : une ligne d''en-têtes, puis les données.', 201, true),

  (d_id, n_deb, 'choix_multiple', 'Dans un TCD, les "champs de ligne" (Rows) servent à :',
   '[{"cle":"a","texte":"Afficher les catégories sous forme de lignes"},{"cle":"b","texte":"Calculer les totaux par colonne"},{"cle":"c","texte":"Filtrer le TCD globalement"},{"cle":"d","texte":"Afficher les valeurs sommées"}]'::jsonb,
   'a', 'Lignes = catégories, Colonnes = sous-catégories, Valeurs = mesures.', 202, true),

  (d_id, n_deb, 'vrai_faux', 'Un TCD se met à jour automatiquement quand les données source changent.',
   null, 'faux', 'Il faut cliquer sur Actualiser, ou activer Actualisation à l''ouverture.', 203, true),

  (d_id, n_deb, 'choix_multiple', 'Pour changer la fonction d''agrégation d''un champ Valeur de SOMME à MOYENNE :',
   '[{"cle":"a","texte":"Clic droit sur le champ → Paramètres des champs de valeurs"},{"cle":"b","texte":"Il faut recréer le TCD"},{"cle":"c","texte":"Modifier directement les cellules calculées"},{"cle":"d","texte":"Aller dans Options Excel → Formules"}]'::jsonb,
   'a', 'Le menu Paramètres des champs de valeurs liste toutes les agrégations possibles.', 204, true),

  -- Intermédiaire
  (d_id, n_int, 'choix_multiple', 'Un Segment (Slicer) sert principalement à :',
   '[{"cle":"a","texte":"Filtrer visuellement un ou plusieurs TCD connectés"},{"cle":"b","texte":"Diviser un TCD en plusieurs feuilles"},{"cle":"c","texte":"Réorganiser les champs automatiquement"},{"cle":"d","texte":"Exporter le TCD en PDF"}]'::jsonb,
   'a', 'Un segment peut être connecté à plusieurs TCD partageant le même cache.', 205, true),

  (d_id, n_int, 'choix_multiple', 'La fonction "Regrouper" dans un TCD permet :',
   '[{"cle":"a","texte":"De créer des intervalles à partir de dates ou de nombres (par mois, trimestre, etc.)"},{"cle":"b","texte":"De fusionner deux TCD distincts"},{"cle":"c","texte":"D''ajouter automatiquement des sous-totaux personnalisés"},{"cle":"d","texte":"De convertir le TCD en tableau classique"}]'::jsonb,
   'a', 'Très utile pour analyser des dates par période ou des nombres par tranche.', 206, true),

  (d_id, n_int, 'vrai_faux', 'Un champ calculé dans un TCD permet d''ajouter une formule basée sur les autres champs de la source.',
   null, 'vrai', 'Onglet Analyse → Champs, éléments et jeux → Champ calculé.', 207, true),

  (d_id, n_int, 'choix_multiple', 'Pour éviter qu''Excel réajuste automatiquement les largeurs de colonnes à chaque actualisation :',
   '[{"cle":"a","texte":"Décocher \"Ajuster automatiquement la largeur\" dans les options du TCD"},{"cle":"b","texte":"Convertir les données en tableau structuré"},{"cle":"c","texte":"Verrouiller la feuille"},{"cle":"d","texte":"Ce comportement n''est pas modifiable"}]'::jsonb,
   'a', 'Options du TCD → Disposition et mise en forme.', 208, true),

  -- Avancé
  (d_id, n_avc, 'choix_multiple', 'La meilleure source de données pour un TCD impliquant plusieurs tables liées est :',
   '[{"cle":"a","texte":"Un modèle de données (Power Pivot) avec relations entre tables"},{"cle":"b","texte":"Une plage Excel classique unique"},{"cle":"c","texte":"Un fichier CSV concaténé"},{"cle":"d","texte":"Une base Access en lecture seule"}]'::jsonb,
   'a', 'Le modèle de données permet de lier les tables sans aplatir les données.', 209, true),

  (d_id, n_avc, 'choix_multiple', 'La fonction LIREDONNEESTABCROISDYNAMIQUE (GETPIVOTDATA) sert à :',
   '[{"cle":"a","texte":"Extraire de manière fiable une valeur précise d''un TCD, indépendamment de sa disposition"},{"cle":"b","texte":"Recalculer le TCD"},{"cle":"c","texte":"Convertir le TCD en formules statiques"},{"cle":"d","texte":"Importer des données vers un TCD"}]'::jsonb,
   'a', 'Très utile pour construire des tableaux de bord qui pointent sur des TCD.', 210, true),

  (d_id, n_avc, 'vrai_faux', 'Un TCD peut afficher ses valeurs en pourcentage du total d''une catégorie parent.',
   null, 'vrai', 'Paramètres des champs de valeurs → Afficher les valeurs → % du total parent.', 211, true),

  (d_id, n_avc, 'choix_multiple', 'Pour créer un TCD à partir de plusieurs feuilles ayant la même structure :',
   '[{"cle":"a","texte":"Utiliser Power Query (Append) ou le modèle de données avec relations"},{"cle":"b","texte":"Copier-coller manuellement toutes les feuilles en une seule"},{"cle":"c","texte":"Excel ne le permet pas"},{"cle":"d","texte":"Utiliser exclusivement les Consolidations multiples (méthode déconseillée)"}]'::jsonb,
   'a', 'Power Query est la méthode moderne, scalable et rafraîchissable.', 212, true),

  -- Expert
  (d_id, n_exp, 'choix_multiple', 'Une mesure DAX dans un TCD basé sur le modèle de données :',
   '[{"cle":"a","texte":"Permet des calculs sophistiqués avec contexte de filtre, réutilisables entre TCD"},{"cle":"b","texte":"Remplace systématiquement les champs calculés classiques sans bénéfice"},{"cle":"c","texte":"Est plus lente que les formules Excel équivalentes"},{"cle":"d","texte":"Nécessite l''utilisation conjointe de Power BI"}]'::jsonb,
   'a', 'Les mesures DAX sont la grande force du modèle Power Pivot dans Excel.', 213, true),

  (d_id, n_exp, 'choix_multiple', 'Un TCD basé sur un modèle de données peut analyser :',
   '[{"cle":"a","texte":"Plusieurs centaines de millions de lignes (compression colonnaire VertiPaq)"},{"cle":"b","texte":"Aucune ligne au-delà des 1 048 576 d''une feuille Excel"},{"cle":"c","texte":"Maximum 2 millions de lignes"},{"cle":"d","texte":"Maximum 65 536 lignes"}]'::jsonb,
   'a', 'La limite est essentiellement la RAM disponible, pas le format de feuille.', 214, true),

  (d_id, n_exp, 'vrai_faux', 'Un TCD peut être directement construit sur le résultat d''une requête Power Query, et se rafraîchir avec.',
   null, 'vrai', 'C''est même le pipeline recommandé pour automatiser un rapport.', 215, true),

  (d_id, n_exp, 'choix_multiple', 'Pour faire un TCD sur 10 ans de données quotidiennes avec time intelligence avancée (YTD, YoY) :',
   '[{"cle":"a","texte":"Utiliser une table calendrier dédiée et des mesures DAX (TOTALYTD, SAMEPERIODLASTYEAR…)"},{"cle":"b","texte":"Créer dix TCD séparés, un par année"},{"cle":"c","texte":"Utiliser uniquement la fonctionnalité \"Regrouper\" d''Excel"},{"cle":"d","texte":"Convertir en fichier Access pour l''analyse"}]'::jsonb,
   'a', 'Table calendrier + relations + mesures DAX = standard de l''analyse temporelle.', 216, true);
end $$;


-- ============================================================================
-- MODÉLISATION FINANCIÈRE
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

  -- Débutant
  (d_id, n_deb, 'choix_multiple', 'La règle d''or de structuration d''un modèle financier est :',
   '[{"cle":"a","texte":"Séparer clairement hypothèses, calculs et résultats"},{"cle":"b","texte":"Tout regrouper dans une seule feuille pour la simplicité"},{"cle":"c","texte":"Utiliser un maximum de couleurs distinctes"},{"cle":"d","texte":"Verrouiller toutes les cellules par défaut"}]'::jsonb,
   'a', 'La séparation est la base d''un modèle auditable et maintenable.', 301, true),

  (d_id, n_deb, 'choix_multiple', 'Une cellule contenant une hypothèse modifiable devrait être identifiée par :',
   '[{"cle":"a","texte":"Une couleur de police distincte (typiquement bleue)"},{"cle":"b","texte":"Une formule complexe"},{"cle":"c","texte":"Un masquage de la cellule"},{"cle":"d","texte":"Une référence vers une autre feuille"}]'::jsonb,
   'a', 'Convention historique : bleu = saisie, noir = formule, vert = lien vers une autre feuille.', 302, true),

  (d_id, n_deb, 'vrai_faux', 'Un modèle financier robuste évite les valeurs codées en dur ("hardcoded") au milieu des formules.',
   null, 'vrai', 'Toute valeur d''entrée doit être isolée dans une cellule dédiée.', 303, true),

  (d_id, n_deb, 'choix_multiple', 'Le but principal d''un modèle financier est :',
   '[{"cle":"a","texte":"Faciliter la prise de décision via des projections et analyses"},{"cle":"b","texte":"Remplacer les états financiers officiels"},{"cle":"c","texte":"Stocker l''historique comptable"},{"cle":"d","texte":"Automatiser la comptabilité quotidienne"}]'::jsonb,
   'a', 'C''est un outil d''aide à la décision, pas un outil comptable.', 304, true),

  -- Intermédiaire
  (d_id, n_int, 'choix_multiple', 'Une analyse de sensibilité à une ou deux variables s''obtient le plus efficacement avec :',
   '[{"cle":"a","texte":"Une table de données (Data Table)"},{"cle":"b","texte":"La fonction SI imbriquée"},{"cle":"c","texte":"Un tableau croisé dynamique"},{"cle":"d","texte":"Le solveur exclusivement"}]'::jsonb,
   'a', 'Onglet Données → Analyse de scénarios → Table de données.', 305, true),

  (d_id, n_int, 'choix_multiple', 'Pour gérer trois scénarios (optimiste / réaliste / pessimiste) :',
   '[{"cle":"a","texte":"Gestionnaire de scénarios ou cellules d''entrée commutables avec INDEX/CHOISIR"},{"cle":"b","texte":"Copier le fichier en trois exemplaires"},{"cle":"c","texte":"Excel ne le permet pas nativement"},{"cle":"d","texte":"Utiliser Power Query"}]'::jsonb,
   'a', 'Une cellule "scénario actif" + CHOISIR ou INDEX permet une bascule instantanée.', 306, true),

  (d_id, n_int, 'vrai_faux', 'La fonction VAN (NPV) intègre par défaut tous les flux y compris celui de la période 0.',
   null, 'faux', 'VAN(taux; flux) suppose que le premier flux est à la période 1. Il faut ajouter F0 à part.', 307, true),

  (d_id, n_int, 'choix_multiple', 'Pour projeter un revenu R₀ avec croissance composée g sur n années, la formule est :',
   '[{"cle":"a","texte":"=R0*(1+g)^n"},{"cle":"b","texte":"=R0*g*n"},{"cle":"c","texte":"=R0+g*n"},{"cle":"d","texte":"=R0/n*g"}]'::jsonb,
   'a', 'Formule classique de capitalisation composée.', 308, true),

  -- Avancé
  (d_id, n_avc, 'choix_multiple', 'L''intégration entre Compte de résultat, Bilan et Flux de trésorerie repose principalement sur :',
   '[{"cle":"a","texte":"Le résultat net (P&L → BFR/Bilan), les variations BFR et les flux d''investissement/financement"},{"cle":"b","texte":"Une simple SOMME de toutes les cellules"},{"cle":"c","texte":"Power Query"},{"cle":"d","texte":"Le gestionnaire de noms d''Excel"}]'::jsonb,
   'a', 'C''est la mécanique du modèle 3-statements lié.', 309, true),

  (d_id, n_avc, 'choix_multiple', 'Le Solveur Excel est particulièrement utile pour :',
   '[{"cle":"a","texte":"Trouver les valeurs d''entrée qui optimisent une cellule cible sous contraintes"},{"cle":"b","texte":"Résoudre uniquement des équations à une seule inconnue"},{"cle":"c","texte":"Optimiser le format visuel des cellules"},{"cle":"d","texte":"Convertir des références relatives en absolues"}]'::jsonb,
   'a', 'Optimisation linéaire ou non-linéaire avec contraintes (max/min, =, <=, >=).', 310, true),

  (d_id, n_avc, 'vrai_faux', 'Un modèle DCF projette typiquement 5 à 10 années explicites suivies d''une valeur terminale.',
   null, 'vrai', 'Au-delà, l''incertitude est trop élevée; on capte la suite avec une valeur terminale (perpétuité ou multiple).', 311, true),

  (d_id, n_avc, 'choix_multiple', 'Une référence circulaire intentionnelle (typique d''intérêts sur dette moyenne) :',
   '[{"cle":"a","texte":"Nécessite d''activer le calcul itératif dans les options Excel"},{"cle":"b","texte":"Est toujours une erreur à éviter"},{"cle":"c","texte":"Empêche la sauvegarde du fichier"},{"cle":"d","texte":"Se résout via une fonction TRIER"}]'::jsonb,
   'a', 'Options → Formules → Activer le calcul itératif (avec limites de nb d''itérations).', 312, true),

  -- Expert
  (d_id, n_exp, 'choix_multiple', 'Un modèle 3-statement entièrement intégré contient :',
   '[{"cle":"a","texte":"Compte de résultat, Bilan et Tableau de flux de trésorerie liés dynamiquement"},{"cle":"b","texte":"Trois feuilles indépendantes saisies à la main"},{"cle":"c","texte":"Trois versions distinctes du même modèle"},{"cle":"d","texte":"Trois exercices comptables successifs"}]'::jsonb,
   'a', 'Cohérence assurée : un changement d''hypothèse impacte les trois états simultanément.', 313, true),

  (d_id, n_exp, 'choix_multiple', 'Une simulation Monte Carlo dans Excel :',
   '[{"cle":"a","texte":"Génère des centaines ou milliers de scénarios via des tirages aléatoires sur les hypothèses"},{"cle":"b","texte":"Calcule une simple moyenne pondérée"},{"cle":"c","texte":"Produit uniquement des graphiques"},{"cle":"d","texte":"N''est pas possible sans VBA"}]'::jsonb,
   'a', 'Possible avec ALEA, ALEA.ENTRE.BORNES, LOI.NORMALE.INVERSE et une table de données.', 314, true),

  (d_id, n_exp, 'vrai_faux', 'Une analyse Monte Carlo nécessite de spécifier des distributions de probabilité pour chaque hypothèse incertaine.',
   null, 'vrai', 'Sans loi de distribution, on ne peut pas tirer aléatoirement.', 315, true),

  (d_id, n_exp, 'choix_multiple', 'Pour assurer un audit-trail rigoureux d''un modèle :',
   '[{"cle":"a","texte":"Documenter chaque hypothèse, versionner le fichier et utiliser le suivi des modifications"},{"cle":"b","texte":"Verrouiller toutes les cellules"},{"cle":"c","texte":"Exporter en PDF chaque mois sans documentation"},{"cle":"d","texte":"L''audit-trail n''est pas faisable en Excel"}]'::jsonb,
   'a', 'Documentation + contrôle de version + cellules de check sont les piliers.', 316, true);
end $$;


-- ============================================================================
-- VBA
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

  -- Débutant
  (d_id, n_deb, 'choix_multiple', 'L''enregistreur de macros sert à :',
   '[{"cle":"a","texte":"Générer automatiquement du code VBA à partir des actions effectuées dans Excel"},{"cle":"b","texte":"Compresser un classeur Excel"},{"cle":"c","texte":"Enregistrer un fichier sous différents formats"},{"cle":"d","texte":"Documenter les modifications apportées au fichier"}]'::jsonb,
   'a', 'Excellent point de départ pour apprendre la syntaxe VBA.', 401, true),

  (d_id, n_deb, 'choix_multiple', 'Pour afficher une boîte de dialogue avec un message en VBA, on utilise :',
   '[{"cle":"a","texte":"MsgBox \"Mon message\""},{"cle":"b","texte":"Print \"Mon message\""},{"cle":"c","texte":"Alert(\"Mon message\")"},{"cle":"d","texte":"Box \"Mon message\""}]'::jsonb,
   'a', 'MsgBox est la fonction native pour afficher une popup.', 402, true),

  (d_id, n_deb, 'vrai_faux', 'Un classeur Excel contenant du code VBA doit être enregistré au format .xlsm pour conserver les macros.',
   null, 'vrai', 'Le format .xlsx ne préserve pas le code VBA. .xlsm = macro-enabled.', 403, true),

  (d_id, n_deb, 'choix_multiple', 'Pour déclarer une variable de type entier en VBA :',
   '[{"cle":"a","texte":"Dim i As Integer"},{"cle":"b","texte":"var i = 0"},{"cle":"c","texte":"int i;"},{"cle":"d","texte":"Set i = Integer"}]'::jsonb,
   'a', 'Dim + nom + As + type. Pour les grands entiers, préférer Long.', 404, true),

  -- Intermédiaire
  (d_id, n_int, 'choix_multiple', 'Une boucle For Each en VBA sert à :',
   '[{"cle":"a","texte":"Itérer sur tous les éléments d''une collection (Cells, Worksheets...)"},{"cle":"b","texte":"Répéter un nombre fixé d''itérations"},{"cle":"c","texte":"Tester une condition une seule fois"},{"cle":"d","texte":"Définir une fonction réutilisable"}]'::jsonb,
   'a', 'For Each rng In Range("A1:A10") parcourt chaque cellule de la plage.', 405, true),

  (d_id, n_int, 'choix_multiple', 'Le bloc With ... End With permet :',
   '[{"cle":"a","texte":"De référencer plusieurs propriétés d''un même objet de manière concise"},{"cle":"b","texte":"D''imbriquer des conditions IF"},{"cle":"c","texte":"De gérer les erreurs runtime"},{"cle":"d","texte":"De déclarer une variable globale"}]'::jsonb,
   'a', 'Évite la répétition: With Range("A1") : .Value=1 : .Font.Bold=True : End With.', 406, true),

  (d_id, n_int, 'vrai_faux', 'L''instruction On Error Resume Next fait ignorer silencieusement toutes les erreurs jusqu''à un nouveau On Error.',
   null, 'vrai', 'Pratique mais dangereux : à utiliser avec parcimonie et à réactiver vite.', 407, true),

  (d_id, n_int, 'choix_multiple', 'Pour accélérer significativement une macro qui modifie beaucoup de cellules :',
   '[{"cle":"a","texte":"Désactiver Application.ScreenUpdating et .Calculation pendant l''exécution"},{"cle":"b","texte":"Compresser le fichier avant de lancer la macro"},{"cle":"c","texte":"Lancer la macro dans un thread séparé"},{"cle":"d","texte":"Utiliser uniquement des variables Variant"}]'::jsonb,
   'a', 'Réduit drastiquement le temps en évitant les rafraîchissements visuels et recalculs.', 408, true),

  -- Avancé
  (d_id, n_avc, 'choix_multiple', 'Une procédure déclarée Private Sub :',
   '[{"cle":"a","texte":"N''est appelable que depuis le même module"},{"cle":"b","texte":"S''exécute plus rapidement que Public Sub"},{"cle":"c","texte":"S''exécute automatiquement à l''ouverture du classeur"},{"cle":"d","texte":"Ne peut pas avoir d''arguments"}]'::jsonb,
   'a', 'Encapsulation classique pour cacher des helpers internes.', 409, true),

  (d_id, n_avc, 'choix_multiple', 'Pour réagir à une modification de cellule sur une feuille :',
   '[{"cle":"a","texte":"Écrire un événement Worksheet_Change dans le module de feuille"},{"cle":"b","texte":"Workbook_Open dans ThisWorkbook"},{"cle":"c","texte":"Une Sub nommée Auto_Run"},{"cle":"d","texte":"Application.OnTime"}]'::jsonb,
   'a', 'L''événement Change reçoit Target as Range, à filtrer pour la zone visée.', 410, true),

  (d_id, n_avc, 'vrai_faux', 'Les classes VBA (modules de classe) permettent de créer des objets personnalisés réutilisables avec propriétés et méthodes.',
   null, 'vrai', 'Programmation orientée objet de base, utile pour structurer de gros projets.', 411, true),

  (d_id, n_avc, 'choix_multiple', 'Pour appeler une API REST (HTTP) depuis VBA :',
   '[{"cle":"a","texte":"Utiliser MSXML2.ServerXMLHTTP ou WinHttp.WinHttpRequest"},{"cle":"b","texte":"Utiliser Application.Quit"},{"cle":"c","texte":"Ce n''est pas faisable en VBA"},{"cle":"d","texte":"Uniquement via Power Query intégré"}]'::jsonb,
   'a', 'Objets COM disponibles via early ou late binding.', 412, true),

  -- Expert
  (d_id, n_exp, 'choix_multiple', 'Pour optimiser une macro qui parcourt des dizaines de milliers de cellules :',
   '[{"cle":"a","texte":"Charger la plage dans une matrice Variant en mémoire, traiter, puis réécrire en une seule passe"},{"cle":"b","texte":"Utiliser Application.Wait entre chaque cellule"},{"cle":"c","texte":"Faire des copier-coller successifs"},{"cle":"d","texte":"Désactiver complètement Excel pendant l''exécution"}]'::jsonb,
   'a', 'Travailler en mémoire est 100x à 1000x plus rapide que les accès cellule par cellule.', 413, true),

  (d_id, n_exp, 'choix_multiple', 'Une fonction définie par l''utilisateur (UDF) appelable comme formule depuis une cellule doit :',
   '[{"cle":"a","texte":"Être déclarée Public Function dans un module standard"},{"cle":"b","texte":"Être systématiquement plus rapide que les formules natives"},{"cle":"c","texte":"Pouvoir modifier d''autres cellules"},{"cle":"d","texte":"Nécessiter une référence externe"}]'::jsonb,
   'a', 'Une UDF ne doit retourner que sa valeur de retour, pas modifier l''environnement.', 414, true),

  (d_id, n_exp, 'vrai_faux', 'VBA peut piloter d''autres applications Office (Word, Outlook, PowerPoint) via Automation COM.',
   null, 'vrai', 'CreateObject("Outlook.Application") ou référence directe via Tools → References.', 415, true),

  (d_id, n_exp, 'choix_multiple', 'La meilleure façon d''éviter des fuites mémoire avec des objets en VBA :',
   '[{"cle":"a","texte":"Affecter Nothing aux variables objet à la fin de leur usage"},{"cle":"b","texte":"Fermer Excel après chaque exécution de macro"},{"cle":"c","texte":"Augmenter la RAM de la machine"},{"cle":"d","texte":"N''utiliser que des variables locales (sans Set)"}]'::jsonb,
   'a', 'Set obj = Nothing libère explicitement la référence COM.', 416, true);
end $$;


-- ============================================================================
-- POWER QUERY
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

  -- Débutant
  (d_id, n_deb, 'choix_multiple', 'Power Query sert principalement à :',
   '[{"cle":"a","texte":"Importer, transformer et combiner des données provenant de sources variées"},{"cle":"b","texte":"Créer des graphiques 3D interactifs"},{"cle":"c","texte":"Calculer des formules complexes dans une cellule"},{"cle":"d","texte":"Sécuriser et protéger un classeur"}]'::jsonb,
   'a', 'C''est l''outil ETL (Extract-Transform-Load) intégré à Excel et Power BI.', 501, true),

  (d_id, n_deb, 'choix_multiple', 'Pour démarrer Power Query dans Excel récent :',
   '[{"cle":"a","texte":"Onglet Données → Obtenir et transformer des données"},{"cle":"b","texte":"Onglet Insertion → Tableau croisé dynamique"},{"cle":"c","texte":"Fichier → Options"},{"cle":"d","texte":"Outils → Macros complémentaires"}]'::jsonb,
   'a', 'L''interface s''ouvre dans la fenêtre Éditeur Power Query.', 502, true),

  (d_id, n_deb, 'vrai_faux', 'Une requête Power Query peut être actualisée à la demande pour rapporter les dernières données de la source.',
   null, 'vrai', 'Onglet Données → Actualiser tout, ou rafraîchissement programmé.', 503, true),

  (d_id, n_deb, 'choix_multiple', 'La séquence de travail typique en Power Query suit le modèle :',
   '[{"cle":"a","texte":"Extraire → Transformer → Charger (ETL)"},{"cle":"b","texte":"Charger → Extraire → Transformer"},{"cle":"c","texte":"Transformer → Extraire → Charger"},{"cle":"d","texte":"Il n''y a aucun ordre imposé"}]'::jsonb,
   'a', 'On commence par se connecter, puis on nettoie/transforme, puis on charge le résultat.', 504, true),

  -- Intermédiaire
  (d_id, n_int, 'choix_multiple', 'La fusion (Merge) de deux requêtes Power Query correspond à :',
   '[{"cle":"a","texte":"Une jointure SQL entre deux tables sur une ou plusieurs clés communes"},{"cle":"b","texte":"Une simple concaténation verticale des lignes"},{"cle":"c","texte":"Un produit cartésien de toutes les combinaisons"},{"cle":"d","texte":"Une suppression des doublons"}]'::jsonb,
   'a', 'Merge propose les types Inner, Left, Right, Full, Anti, etc.', 505, true),

  (d_id, n_int, 'choix_multiple', 'Pour combiner verticalement deux requêtes (empiler des lignes ayant la même structure) :',
   '[{"cle":"a","texte":"Utiliser Ajouter (Append) des requêtes"},{"cle":"b","texte":"Utiliser Fusionner (Merge)"},{"cle":"c","texte":"Utiliser le Pivot"},{"cle":"d","texte":"Utiliser Grouper par"}]'::jsonb,
   'a', 'Append empile, Merge joint horizontalement.', 506, true),

  (d_id, n_int, 'vrai_faux', 'Power Query enregistre chaque étape de transformation dans un ordre modifiable a posteriori.',
   null, 'vrai', 'Les étapes appliquées sont listées à droite et peuvent être réordonnées/supprimées.', 507, true),

  (d_id, n_int, 'choix_multiple', 'Pour grouper des données et agréger des valeurs dans Power Query :',
   '[{"cle":"a","texte":"Onglet Transformer → Grouper par"},{"cle":"b","texte":"Onglet Insertion → Tableau croisé dynamique"},{"cle":"c","texte":"Données → Sous-totaux"},{"cle":"d","texte":"Cela nécessite obligatoirement du VBA"}]'::jsonb,
   'a', 'Permet SUM, COUNT, AVG, MIN, MAX, et plus, par une ou plusieurs colonnes.', 508, true),

  -- Avancé
  (d_id, n_avc, 'choix_multiple', 'Le langage M utilisé par Power Query est :',
   '[{"cle":"a","texte":"Un langage fonctionnel propre à Power Query, distinct du DAX"},{"cle":"b","texte":"Identique au langage DAX"},{"cle":"c","texte":"Un sous-ensemble simplifié de VBA"},{"cle":"d","texte":"Du SQL standard"}]'::jsonb,
   'a', 'M est insensible à la casse partielle, riche en fonctions de listes, tables et records.', 509, true),

  (d_id, n_avc, 'choix_multiple', 'Une requête paramétrée permet :',
   '[{"cle":"a","texte":"De réutiliser la même requête avec des valeurs d''entrée variables (chemin, date, etc.)"},{"cle":"b","texte":"De crypter les données chargées"},{"cle":"c","texte":"D''écrire automatiquement des macros VBA"},{"cle":"d","texte":"De partager un fichier sans données"}]'::jsonb,
   'a', 'Les paramètres se gèrent via Accueil → Gérer les paramètres.', 510, true),

  (d_id, n_avc, 'vrai_faux', 'Une fonction personnalisée en M se déclare avec la syntaxe (param) => let ... in ... .',
   null, 'vrai', 'Standard pour encapsuler une logique réutilisable sur chaque ligne ou liste.', 511, true),

  (d_id, n_avc, 'choix_multiple', 'Pour optimiser une requête Power Query lente :',
   '[{"cle":"a","texte":"Pousser les filtres et la réduction de colonnes au plus tôt dans le pipeline"},{"cle":"b","texte":"Ajouter le plus d''étapes possible pour la lisibilité"},{"cle":"c","texte":"Ne jamais charger dans le modèle de données"},{"cle":"d","texte":"Désactiver le rafraîchissement automatique"}]'::jsonb,
   'a', 'Moins de données à manipuler en aval = plus rapide. Permet aussi le query folding.', 512, true),

  -- Expert
  (d_id, n_exp, 'choix_multiple', 'Le query folding consiste à :',
   '[{"cle":"a","texte":"Faire exécuter les transformations directement par la source (ex : SQL Server) via une requête native"},{"cle":"b","texte":"Replier visuellement le code M pour gagner de la place"},{"cle":"c","texte":"Compresser le fichier source"},{"cle":"d","texte":"Diviser une grosse requête en plusieurs sous-requêtes"}]'::jsonb,
   'a', 'Quand le query folding casse, Power Query bascule en exécution locale (souvent plus lent).', 513, true),

  (d_id, n_exp, 'choix_multiple', 'List.Generate en langage M permet :',
   '[{"cle":"a","texte":"De créer une liste itérative à partir d''une fonction d''état (équivalent d''une boucle)"},{"cle":"b","texte":"De copier une liste existante telle quelle"},{"cle":"c","texte":"De convertir automatiquement une liste en table"},{"cle":"d","texte":"De supprimer les doublons d''une liste"}]'::jsonb,
   'a', 'Très puissant pour des suites complexes (générations cumulées, simulations).', 514, true),

  (d_id, n_exp, 'vrai_faux', 'Power Query peut consommer une API REST authentifiée (clé API, OAuth2, etc.).',
   null, 'vrai', 'Web.Contents avec Headers permet d''envoyer les jetons et clés requis.', 515, true),

  (d_id, n_exp, 'choix_multiple', 'Pour extraire les données d''un tableau HTML d''une page web :',
   '[{"cle":"a","texte":"Web.Page combiné à Web.Contents, puis sélectionner la table dans Navigation"},{"cle":"b","texte":"Power Query ne supporte pas le HTML"},{"cle":"c","texte":"Cela nécessite obligatoirement du VBA et Internet Explorer"},{"cle":"d","texte":"Utiliser exclusivement l''API de Google Sheets"}]'::jsonb,
   'a', 'Méthode standard pour le scraping de pages relativement structurées.', 516, true);
end $$;


-- ============================================================================
-- POWER PIVOT
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

  -- Débutant
  (d_id, n_deb, 'choix_multiple', 'Power Pivot permet principalement de :',
   '[{"cle":"a","texte":"Construire un modèle de données multi-tables pouvant contenir des centaines de millions de lignes"},{"cle":"b","texte":"Faire des graphiques 3D interactifs"},{"cle":"c","texte":"Convertir un classeur Excel en rapport Power BI"},{"cle":"d","texte":"Compresser des fichiers volumineux pour le partage"}]'::jsonb,
   'a', 'Moteur columnstore VertiPaq + langage DAX pour l''analyse à grande échelle.', 601, true),

  (d_id, n_deb, 'choix_multiple', 'Une relation entre deux tables dans le modèle de données nécessite :',
   '[{"cle":"a","texte":"Une colonne commune (clé) avec des valeurs qui correspondent"},{"cle":"b","texte":"Que les deux tables aient exactement le même nombre de lignes"},{"cle":"c","texte":"Une formule de liaison RECHERCHEV"},{"cle":"d","texte":"Que les tables soient toutes dans le même fichier Excel"}]'::jsonb,
   'a', 'Idéalement un côté "un" (clé unique) et un côté "plusieurs".', 602, true),

  (d_id, n_deb, 'vrai_faux', 'Le modèle de données Power Pivot est strictement limité à 1 048 576 lignes par table, comme une feuille Excel.',
   null, 'faux', 'La limite est essentiellement la RAM. Plusieurs centaines de millions de lignes sont possibles.', 603, true),

  (d_id, n_deb, 'choix_multiple', 'Une mesure DAX simple qui somme la colonne Montant de la table Ventes s''écrit :',
   '[{"cle":"a","texte":"Total Ventes := SUM(''Ventes''[Montant])"},{"cle":"b","texte":"Total Ventes := SOMME(A1:A10)"},{"cle":"c","texte":"Total Ventes := SUMIF()"},{"cle":"d","texte":"=Ventes!Montant"}]'::jsonb,
   'a', 'Syntaxe DAX : Nom_mesure := EXPRESSION avec référence Table[Colonne].', 604, true),

  -- Intermédiaire
  (d_id, n_int, 'choix_multiple', 'La fonction CALCULATE en DAX permet :',
   '[{"cle":"a","texte":"D''évaluer une expression dans un contexte de filtre modifié"},{"cle":"b","texte":"De calculer une formule Excel classique sans contexte"},{"cle":"c","texte":"De convertir une mesure en colonne calculée"},{"cle":"d","texte":"De copier-coller une formule rapidement"}]'::jsonb,
   'a', 'C''est LA fonction centrale de DAX, permet filtres, time intelligence, etc.', 605, true),

  (d_id, n_int, 'choix_multiple', 'SUMX se distingue de SUM par :',
   '[{"cle":"a","texte":"Son itération ligne par ligne avec une expression évaluée pour chaque ligne"},{"cle":"b","texte":"Une syntaxe plus courte"},{"cle":"c","texte":"Le retour d''un texte au lieu d''un nombre"},{"cle":"d","texte":"Aucune différence notable"}]'::jsonb,
   'a', 'SUMX(Table; expression) est un itérateur. SUM(colonne) est un agrégateur simple.', 606, true),

  (d_id, n_int, 'vrai_faux', 'Une table calendrier (Date Table) dédiée est essentielle pour utiliser efficacement la time intelligence en DAX.',
   null, 'vrai', 'YTD, MTD, comparaisons année-année reposent toutes sur une table de dates marquée.', 607, true),

  (d_id, n_int, 'choix_multiple', 'Pour calculer un total Year-To-Date des ventes :',
   '[{"cle":"a","texte":"YTD Ventes := TOTALYTD(SUM(Ventes[Montant]); ''Calendrier''[Date])"},{"cle":"b","texte":"YTD Ventes := SUMYTD()"},{"cle":"c","texte":"Possible uniquement via un TCD classique"},{"cle":"d","texte":"Ce calcul n''est pas réalisable en DAX"}]'::jsonb,
   'a', 'TOTALYTD est la fonction de time intelligence dédiée.', 608, true),

  -- Avancé
  (d_id, n_avc, 'choix_multiple', 'Le contexte de ligne (row context) en DAX existe principalement dans :',
   '[{"cle":"a","texte":"Les colonnes calculées et les fonctions itératives (SUMX, FILTER, ADDCOLUMNS...)"},{"cle":"b","texte":"Toutes les mesures DAX par défaut"},{"cle":"c","texte":"Uniquement avec CALCULATE"},{"cle":"d","texte":"Dans les TCD seulement"}]'::jsonb,
   'a', 'Mesures = contexte de filtre. Colonnes calculées + itérateurs = contexte de ligne.', 609, true),

  (d_id, n_avc, 'choix_multiple', 'La fonction ALL en DAX :',
   '[{"cle":"a","texte":"Supprime tous les filtres d''une colonne, table ou modèle donné"},{"cle":"b","texte":"Sélectionne toutes les colonnes d''une table"},{"cle":"c","texte":"Vérifie si toutes les conditions sont vraies"},{"cle":"d","texte":"Affiche toutes les lignes d''une table dans le visuel"}]'::jsonb,
   'a', 'Indispensable pour les calculs de % du total, classements, etc.', 610, true),

  (d_id, n_avc, 'vrai_faux', 'VALUES et DISTINCT diffèrent notamment dans la gestion des valeurs "blank" issues des relations cassées.',
   null, 'vrai', 'VALUES peut renvoyer une ligne blank pour les références orphelines, DISTINCT non.', 611, true),

  (d_id, n_avc, 'choix_multiple', 'Pour comparer les ventes courantes vs la même période l''année précédente :',
   '[{"cle":"a","texte":"CALCULATE(SUM(Ventes[Montant]); SAMEPERIODLASTYEAR(''Calendrier''[Date]))"},{"cle":"b","texte":"=A1-A2 dans une cellule"},{"cle":"c","texte":"Un graphique combo suffit, sans calcul"},{"cle":"d","texte":"Append de deux requêtes Power Query"}]'::jsonb,
   'a', 'Pattern standard de time intelligence DAX.', 612, true),

  -- Expert
  (d_id, n_exp, 'choix_multiple', 'La transition de contexte (context transition) en DAX :',
   '[{"cle":"a","texte":"Convertit un contexte de ligne en contexte de filtre, déclenchée par CALCULATE (et les mesures référencées)"},{"cle":"b","texte":"Change la langue affichée du modèle"},{"cle":"c","texte":"Bascule entre mode Import et DirectQuery"},{"cle":"d","texte":"Est une option d''actualisation manuelle"}]'::jsonb,
   'a', 'Concept fondamental pour comprendre comment SUMX(Table; [Mesure]) fonctionne.', 613, true),

  (d_id, n_exp, 'choix_multiple', 'Pour optimiser une mesure itérative coûteuse (ex : SUMX sur des millions de lignes) :',
   '[{"cle":"a","texte":"Utiliser des variables VAR, simplifier l''expression itérée, ou préfaire le calcul en colonne quand pertinent"},{"cle":"b","texte":"Les itérateurs sont toujours optimaux, rien à faire"},{"cle":"c","texte":"Déplacer le calcul en Power Query systématiquement"},{"cle":"d","texte":"Ajouter des appels à RAND() pour paralléliser"}]'::jsonb,
   'a', 'VAR cache un résultat intermédiaire et évite des recalculs redondants.', 614, true),

  (d_id, n_exp, 'vrai_faux', 'USERELATIONSHIP active une relation inactive pour la durée d''un CALCULATE.',
   null, 'vrai', 'Indispensable quand plusieurs relations existent entre deux tables (ex : date commande vs date livraison).', 615, true),

  (d_id, n_exp, 'choix_multiple', 'Pour optimiser un gros modèle de données :',
   '[{"cle":"a","texte":"Réduire la cardinalité des colonnes, adopter un schéma en étoile, éviter les colonnes calculées quand une mesure suffit"},{"cle":"b","texte":"Mettre toutes les données dans une seule grosse table aplatie"},{"cle":"c","texte":"Utiliser exclusivement DirectQuery"},{"cle":"d","texte":"Multiplier les relations bidirectionnelles partout"}]'::jsonb,
   'a', 'Le schéma en étoile (faits + dimensions) est la meilleure pratique éprouvée.', 616, true);
end $$;
