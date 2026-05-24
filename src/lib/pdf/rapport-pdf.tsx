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

const t = getTranslations();

const PALIERS: Array<{ slug: NiveauSlug; label: string }> = [
  { slug: "debutant", label: "Débutant" },
  { slug: "intermediaire", label: "Intermédiaire" },
  { slug: "avance", label: "Avancé" },
  { slug: "expert", label: "Expert" }
];

const COULEUR_PRIMAIRE = "#0F4C5C";
const COULEUR_PRIMAIRE_SOFT = "#E6EEF1";
const COULEUR_MUTED = "#E2E8F0";
const COULEUR_MUTED_TEXT = "#64748B";
const COULEUR_AMBRE = "#F59E0B";
const COULEUR_AMBRE_BG = "#FFFBEB";
const COULEUR_AMBRE_TEXT = "#92400E";
// Accent doré CFO Masqué (utilisé pour mettre en valeur le niveau Expert atteint)
const COULEUR_OR = "#E5A823";
const COULEUR_OR_BG = "#FEF6E1";

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
  domaineCarte: {
    border: "1 solid " + COULEUR_MUTED,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12
  },
  domaineEntete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10
  },
  domaineNom: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A"
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
  }
});

function BarreNiveauPDF({ niveau_atteint }: { niveau_atteint: NiveauSlug | null }) {
  const idx_atteint = niveau_atteint
    ? PALIERS.findIndex((p) => p.slug === niveau_atteint)
    : -1;
  const expertAtteint = niveau_atteint === "expert";
  return (
    <View>
      <View style={styles.barreRow}>
        {PALIERS.map((p, i) => {
          const actif = i <= idx_atteint;
          const dore = expertAtteint && p.slug === "expert";
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
          return (
            <Text
              key={p.slug}
              style={[
                styles.labelCell,
                dore ? styles.labelOr : actif ? styles.labelActif : styles.labelInactif
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

        {donnees.resultats.map((r) => {
          const reco = recoParDomaine.get(r.domaine_id);
          const estExpert = r.niveau_atteint === "expert";
          return (
            <View key={r.domaine_id} style={styles.domaineCarte}>
              <View style={styles.domaineEntete}>
                <Text style={styles.domaineNom}>{r.domaine_nom}</Text>
                <Text style={styles.niveauTexte}>{r.niveau_nom}</Text>
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

        <Text style={styles.pied} fixed>
          {t.marque.nom} • Rapport généré le {new Date().toLocaleDateString("fr-CA")}
        </Text>
      </Page>
    </Document>
  );
}
