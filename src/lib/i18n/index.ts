import frTranslations from "./fr.json";

/**
 * Architecture i18n minimale (FR seulement en Phase 1).
 * Pour ajouter une langue en Phase 2 :
 *   1. Créer src/lib/i18n/en.json (mêmes clés)
 *   2. Ajouter "en" à AvailableLocale
 *   3. Faire évoluer getTranslations() pour lire le cookie / header.
 */
export type AvailableLocale = "fr";
export const DEFAULT_LOCALE: AvailableLocale = "fr";

const dictionaries: Record<AvailableLocale, typeof frTranslations> = {
  fr: frTranslations
};

export function getTranslations(locale: AvailableLocale = DEFAULT_LOCALE) {
  return dictionaries[locale];
}

/**
 * Helper de substitution naïve pour les chaînes avec placeholders {clef}.
 */
export function tr(
  template: string,
  vars: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

export type Translations = typeof frTranslations;
