'use client'

import { useSettingsStore } from '@/store/settingsStore'
import translations, { type TranslationMap, type LanguageCode } from '@/lib/translations'

/**
 * Returns a `t()` function that translates keys into the currently
 * selected language.  Falls back to English when a key is missing.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language)

  function t(key: keyof TranslationMap): string {
    const lang = (language in translations ? language : 'en-US') as LanguageCode
    const dict = translations[lang]
    const val = dict[key]
    if (val !== undefined) return val
    // Fallback to English
    const fallback = translations['en-US'][key]
    return fallback ?? key
  }

  return { t, language }
}
