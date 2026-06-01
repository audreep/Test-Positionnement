/* eslint-disable @next/next/no-img-element */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link
} from "@react-pdf/renderer";
import type { DonneesRapport } from "@/lib/adaptive/runner";
import type { Formation, NiveauSlug } from "@/lib/supabase/types";
import { getTranslations } from "@/lib/i18n";
import { RadarPDF } from "@/lib/pdf/RadarPDF";
import { IconeDomainePDF } from "@/lib/pdf/IconeDomainePDF";
import { construirePlanFormation } from "@/lib/rapport/plan";

const t = getTranslations();

const PALIERS: Array<{ slug: NiveauSlug; label: string }> = [
  { slug: "debutant", label: "Débutant" },
  { slug: "intermediaire", label: "Intermédiaire" },
  { slug: "avance", label: "Avancé" },
  { slug: "expert", label: "Expert" }
];

const COULEUR_PRIMAIRE = "#2673BA";
const COULEUR_PRIMAIRE_SOFT = "#E6F1FB";
const COULEUR_MUTED = "#E2E8F0";
const COULEUR_MUTED_TEXT = "#64748B";
const COULEUR_AMBRE = "#F59E0B";
const COULEUR_AMBRE_BG = "#FFFBEB";
const COULEUR_AMBRE_TEXT = "#92400E";
// Accent doré CFO Masqué (utilisé pour mettre en valeur le niveau Expert atteint)
const COULEUR_OR = "#DA8F29";
const COULEUR_OR_BG = "#FEF6E1";

const DESCRIPTIONS_DOMAINES = (t as unknown as {
  domaines_description: Record<string, string>;
}).domaines_description;

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF"
  },
  header: {
    borderBottom: "2 solid " + COULEUR_PRIMAIRE,
    paddingBottom: 16,
    marginBottom: 24
  },
  marque: {
    fontSize: 9,
    color: COULEUR_PRIMAIRE,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4
  },
  titre: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_PRIMAIRE
  },
  sousTitre: {
    fontSize: 11,
    color: COULEUR_MUTED_TEXT,
    marginTop: 4
  },
  // Carte « profil » — radar de vue d'ensemble
  profilCarte: {
    border: "1 solid " + COULEUR_MUTED,
    borderTop: "3 solid " + COULEUR_OR,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center"
  },
  profilRadar: {
    width: 210,
    marginRight: 8
  },
  profilTexte: {
    flex: 1,
    paddingLeft: 4
  },
  profilLabel: {
    fontSize: 8,
    color: COULEUR_PRIMAIRE,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3
  },
  profilTitre: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 4
  },
  profilIntro: {
    fontSize: 9,
    color: COULEUR_MUTED_TEXT,
    lineHeight: 1.45
  },

  // Plan de formation (résumé ordonné, page 1)
  planCarte: {
    backgroundColor: COULEUR_PRIMAIRE_SOFT,
    border: "1 solid " + COULEUR_PRIMAIRE,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16
  },
  planTitre: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_PRIMAIRE,
    marginBottom: 2
  },
  planIntro: {
    fontSize: 8.5,
    color: COULEUR_MUTED_TEXT,
    lineHeight: 1.4,
    marginBottom: 8
  },
  planLigne: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6
  },
  planNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COULEUR_PRIMAIRE,
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 3,
    marginRight: 8
  },
  planContenu: { flex: 1 },
  planFormTitre: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A"
  },
  planFormLien: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_PRIMAIRE,
    textDecoration: "underline"
  },
  planMeta: {
    fontSize: 8,
    color: COULEUR_MUTED_TEXT,
    marginTop: 1
  },
  planVide: {
    fontSize: 9,
    color: COULEUR_PRIMAIRE,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.4
  },
  domaineCarte: {
    border: "1 solid " + COULEUR_MUTED,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12
  },
  domaineEntete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  domaineTitreGroupe: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  iconeBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: COULEUR_PRIMAIRE_SOFT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  domaineNom: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A"
  },
  niveauPastille: {
    fontSize: 9,
    color: "#FFFFFF",
    backgroundColor: COULEUR_PRIMAIRE,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10
  },
  niveauTexte: {
    fontSize: 10,
    color: COULEUR_MUTED_TEXT,
    fontFamily: "Helvetica-Bold"
  },
  barreRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3
  },
  segmentActif: { backgroundColor: COULEUR_PRIMAIRE },
  segmentInactif: { backgroundColor: COULEUR_MUTED },
  segmentOr: { backgroundColor: COULEUR_OR },
  // Segment Débutant partiellement rempli (niveau « Aucun », en route)
  segmentEnRouteFill: {
    height: 6,
    width: "35%",
    backgroundColor: "#6FA3D6",
    borderRadius: 3
  },
  labelsRow: { flexDirection: "row", gap: 4, marginBottom: 12 },
  labelCell: {
    flex: 1,
    fontSize: 8,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  labelActif: { color: COULEUR_PRIMAIRE, fontFamily: "Helvetica-Bold" },
  labelInactif: { color: COULEUR_MUTED_TEXT },
  labelOr: { color: COULEUR_OR, fontFamily: "Helvetica-Bold" },
  labelEnRoute: { color: "#6FA3D6", fontFamily: "Helvetica-Bold" },

  // Bloc pré-requis
  prereqBloc: {
    backgroundColor: COULEUR_AMBRE_BG,
    border: "1 dashed " + COULEUR_AMBRE,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8
  },
  prereqLabel: {
    fontSize: 8,
    color: COULEUR_AMBRE_TEXT,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6
  },
  prereqLigne: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4
  },
  prereqNum: {
    width: 16,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_AMBRE_TEXT
  },
  prereqContenu: { flex: 1 },
  prereqTitre: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_AMBRE_TEXT
  },
  prereqMeta: { fontSize: 8, color: COULEUR_AMBRE_TEXT, marginTop: 1 },
  prereqLink: { textDecoration: "underline" },
  prereqCibleNum: {
    width: 16,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COULEUR_PRIMAIRE
  },
  prereqCibleTitre: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A"
  },
  prereqCibleMarqueur: {
    fontSize: 8,
    color: COULEUR_PRIMAIRE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4
  },

  // Bloc formation cible
  recoBloc: {
    backgroundColor: "#F7F9FB",
    border: "1 solid " + COULEUR_MUTED,
    borderRadius: 4,
    padding: 10
  },
  recoLabel: {
    fontSize: 8,
    color: COULEUR_PRIMAIRE,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3
  },
  recoTitre: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  recoDescription: {
    fontSize: 9,
    color: "#475569",
    marginTop: 3,
    lineHeight: 1.4
  },
  recoMeta: { fontSize: 8, color: COULEUR_MUTED_TEXT, marginTop: 5 },
  recoUrl: {
    fontSize: 8,
    color: COULEUR_PRIMAIRE,
    marginTop: 3,
    textDecoration: "underline"
  },

  // Bloc Expert — accent doré CFO Masqué
  expertBloc: {
    backgroundColor: COULEUR_OR_BG,
    border: "1 solid " + COULEUR_OR,
    borderRadius: 4,
    padding: 10
  },
  expertTexte: {
    fontSize: 10,
    color: "#0F172A",
    fontFamily: "Helvetica-Bold"
  },
  pied: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    paddingTop: 8,
    borderTop: "1 solid " + COULEUR_MUTED,
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "center"
  },

  // Bandeau bêta + décharge de responsabilité (en-tête de rapport)
  betaBanner: {
    backgroundColor: COULEUR_AMBRE_BG,
    border: "1 solid " + COULEUR_AMBRE,
    borderRadius: 3,
    padding: 6,
    marginBottom: 8,
    fontSize: 8,
    color: COULEUR_AMBRE_TEXT,
    textAlign: "center"
  },
  noteBloc: {
    backgroundColor: "#F7F9FB",
    border: "1 solid " + COULEUR_MUTED,
    borderRadius: 3,
    padding: 8,
    marginBottom: 16
  },
  noteLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 3
  },
  noteTexte: {
    fontSize: 8,
    color: COULEUR_MUTED_TEXT,
    lineHeight: 1.4
  },

  // Section domaines non pertinents (informationnelle, discrète)
  nonPertinentSection: {
    border: "1 dashed " + COULEUR_MUTED,
    borderRadius: 4,
    padding: 10,
    marginTop: 12
  },
  nonPertinentTitre: {
    fontSize: 9,
    color: COULEUR_MUTED_TEXT,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4
  },
  nonPertinentIntro: {
    fontSize: 8,
    color: COULEUR_MUTED_TEXT,
    marginBottom: 6,
    lineHeight: 1.4
  },
  nonPertinentItem: {
    backgroundColor: "#FFFFFF",
    padding: 6,
    marginBottom: 4,
    borderRadius: 3
  },
  nonPertinentNom: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A"
  },
  nonPertinentDescription: {
    fontSize: 8,
    color: COULEUR_MUTED_TEXT,
    marginTop: 2,
    lineHeight: 1.4
  },
  nonPertinentLien: {
    fontSize: 8,
    color: COULEUR_MUTED_TEXT,
    textDecoration: "underline",
    marginTop: 3
  }
});

function BarreNiveauPDF({ niveau_atteint }: { niveau_atteint: NiveauSlug | null }) {
  const idx_atteint = niveau_atteint
    ? PALIERS.findIndex((p) => p.slug === niveau_atteint)
    : -1;
  const expertAtteint = niveau_atteint === "expert";
  const enRoute = idx_atteint === -1; // « Aucun » → progression vers Débutant
  return (
    <View>
      <View style={styles.barreRow}>
        {PALIERS.map((p, i) => {
          const actif = i <= idx_atteint;
          const dore = expertAtteint && p.slug === "expert";
          const partiel = enRoute && i === 0;
          if (partiel) {
            return (
              <View key={p.slug} style={[styles.segment, styles.segmentInactif]}>
                <View style={styles.segmentEnRouteFill} />
              </View>
            );
          }
          return (
            <View
              key={p.slug}
              style={[
                styles.segment,
                dore ? styles.segmentOr : actif ? styles.segmentActif : styles.segmentInactif
              ]}
            />
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {PALIERS.map((p, i) => {
          const actif = i <= idx_atteint;
          const dore = expertAtteint && p.slug === "expert";
          const partiel = enRoute && i === 0;
          return (
            <Text
              key={p.slug}
              style={[
                styles.labelCell,
                dore
                  ? styles.labelOr
                  : actif
                    ? styles.labelActif
                    : partiel
                      ? styles.labelEnRoute
                      : styles.labelInactif
              ]}
            >
              {p.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function ChaineRecoPDF({ chaine }: { chaine: Formation[] }) {
  if (chaine.length === 0) return null;
  return (
    <View style={styles.prereqBloc}>
      <Text style={styles.prereqLabel}>
        Pré-requis à compléter avant
      </Text>
      <Text style={[styles.prereqMeta, { marginBottom: 6 }]}>
        Les formations ci-dessous sont recommandées dans cet ordre avant la
        formation cible.
      </Text>
      {chaine.map((p, i) => (
        <View key={p.id} style={[styles.prereqLigne, { marginTop: 4 }]}>
          <Text style={styles.prereqNum}>{i + 1}.</Text>
          <View style={styles.prereqContenu}>
            <Text style={styles.prereqTitre}>{p.titre}</Text>
            {p.description ? (
              <Text style={[styles.recoDescription, { color: COULEUR_AMBRE_TEXT }]}>
                {p.description}
              </Text>
            ) : null}
            <Link src={p.url_inscription} style={[styles.recoUrl, { color: COULEUR_AMBRE_TEXT }]}>
              {p.url_inscription}
            </Link>
          </View>
        </View>
      ))}
    </View>
  );
}

export function RapportPDF({ donnees }: { donnees: DonneesRapport }) {
  const recoParDomaine = new Map(
    donnees.recommandations.map((r) => [r.domaine_id, r])
  );

  // Domaines réellement évalués (hors « non évalués »), pour le radar.
  const domainesRadar = donnees.resultats.filter((r) => !r.passe);

  // Plan de formation consolidé (ordre logique, pré-requis d'abord).
  const plan = construirePlanFormation(donnees.recommandations);

  return (
    <Document title={`${t.rapport.titre} – ${donnees.client.prenom} ${donnees.client.nom}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.marque}>{t.marque.nom}</Text>
          <Text style={styles.titre}>{t.rapport.titre}</Text>
          <Text style={styles.sousTitre}>
            {donnees.client.prenom} {donnees.client.nom} • {donnees.client.courriel}
          </Text>
        </View>

        {/* Bandeau bêta */}
        <Text style={styles.betaBanner}>
          Version bêta — cette application est en cours d&apos;évolution. Des
          erreurs peuvent survenir ; merci de nous les signaler.
        </Text>

        {/* Décharge de responsabilité */}
        <View style={styles.noteBloc}>
          <Text style={styles.noteLabel}>Note importante</Text>
          <Text style={styles.noteTexte}>
            Ce rapport est fourni à titre informatif uniquement. Le CFO Masqué
            ne garantit pas la compétence des participants : les tests ne sont
            pas surveillés et ne permettent pas de valider l&apos;authenticité
            des réponses fournies. Le CFO Masqué ne pourra être tenu
            responsable si un participant obtient un résultat supérieur à ses
            compétences réelles (par exemple en utilisant une aide externe
            pendant le test).
          </Text>
        </View>

        {/* Profil global — radar des domaines évalués */}
        {domainesRadar.length >= 3 ? (
          <View style={styles.profilCarte} wrap={false}>
            <View style={styles.profilRadar}>
              <RadarPDF domaines={domainesRadar} />
            </View>
            <View style={styles.profilTexte}>
              <Text style={styles.profilLabel}>Votre profil</Text>
              <Text style={styles.profilTitre}>
                Vos compétences en un coup d&apos;œil
              </Text>
              <Text style={styles.profilIntro}>
                Le radar synthétise votre niveau atteint dans chacun des domaines
                évalués. Plus la zone bleue s&apos;étend vers l&apos;extérieur,
                plus votre maîtrise est avancée. Le détail domaine par domaine,
                avec nos recommandations, suit ci-dessous.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Plan de formation — résumé ordonné (page 1) */}
        <View style={styles.planCarte} wrap={false}>
          <Text style={styles.planTitre}>Votre plan de formation</Text>
          {plan.length > 0 ? (
            <>
              <Text style={styles.planIntro}>
                Voici, dans l&apos;ordre logique à suivre (les pré-requis
                d&apos;abord), les formations recommandées d&apos;après vos
                résultats. Le détail par domaine suit dans les pages suivantes.
              </Text>
              {plan.map((etape, i) => (
                <View key={etape.formation.id} style={styles.planLigne}>
                  <Text style={styles.planNum}>{i + 1}</Text>
                  <View style={styles.planContenu}>
                    <Link src={etape.formation.url_inscription} style={styles.planFormLien}>
                      {etape.formation.titre}
                    </Link>
                    <Text style={styles.planMeta}>
                      {etape.domaine_nom}
                      {etape.formation.duree ? " • " + etape.formation.duree : ""}
                      {etape.est_cible ? " • Formation cible" : " • Pré-requis"}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.planVide}>
              Bravo ! Aucune formation n&apos;est nécessaire : vous avez atteint
              le plus haut niveau testé dans tous les domaines évalués.
            </Text>
          )}
        </View>

        {donnees.resultats.map((r) => {
          const reco = recoParDomaine.get(r.domaine_id);
          const estExpert = r.niveau_atteint === "expert";
          return (
            <View key={r.domaine_id} style={styles.domaineCarte} wrap={false}>
              <View style={styles.domaineEntete}>
                <View style={styles.domaineTitreGroupe}>
                  <View style={styles.iconeBadge}>
                    <IconeDomainePDF slug={r.domaine_slug} couleur={COULEUR_PRIMAIRE} />
                  </View>
                  <Text style={styles.domaineNom}>{r.domaine_nom}</Text>
                </View>
                <Text style={styles.niveauPastille}>{r.niveau_nom}</Text>
              </View>

              <BarreNiveauPDF niveau_atteint={r.niveau_atteint} />


              {estExpert ? (
                <View style={styles.expertBloc}>
                  <Text style={styles.expertTexte}>
                    Vous maîtrisez ce domaine au plus haut niveau testé — bravo !
                  </Text>
                </View>
              ) : reco ? (
                <View>
                  {/* 1. Formation cible — en premier */}
                  <View style={[styles.recoBloc, { marginBottom: 8 }]}>
                    <Text style={styles.recoLabel}>Formation recommandée</Text>
                    <Text style={styles.recoTitre}>{reco.formation.titre}</Text>
                    {reco.formation.description ? (
                      <Text style={styles.recoDescription}>
                        {reco.formation.description}
                      </Text>
                    ) : null}
                    <Link src={reco.formation.url_inscription} style={styles.recoUrl}>
                      {reco.formation.url_inscription}
                    </Link>
                  </View>
                  {/* 2. Pré-requis — en dessous */}
                  <ChaineRecoPDF chaine={reco.prerequis_chaine} />
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Domaines non pertinents — affichés à titre informatif */}
        {donnees.domaines_non_pertinents.length > 0 ? (
          <View style={styles.nonPertinentSection} wrap={false}>
            <Text style={styles.nonPertinentTitre}>
              {t.rapport.non_pertinent_titre}
            </Text>
            <Text style={styles.nonPertinentIntro}>
              {t.rapport.non_pertinent_intro}
            </Text>
            {donnees.domaines_non_pertinents.map((d) => (
              <View key={d.domaine_id} style={styles.nonPertinentItem}>
                <Text style={styles.nonPertinentNom}>{d.domaine_nom}</Text>
                <Text style={styles.nonPertinentDescription}>
                  {DESCRIPTIONS_DOMAINES?.[d.domaine_slug] ?? ""}
                </Text>
                {d.formation_intro ? (
                  <Link
                    src={d.formation_intro.url_inscription}
                    style={styles.nonPertinentLien}
                  >
                    {t.rapport.non_pertinent_en_savoir_plus} : {d.formation_intro.titre}
                  </Link>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.pied} fixed>
          {t.marque.nom} • Rapport généré le {new Date().toLocaleDateString("fr-CA")}
        </Text>
      </Page>
    </Document>
  );
}
