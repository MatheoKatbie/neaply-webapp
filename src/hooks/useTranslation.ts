'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function useTranslation() {
  const { t, locale, changeLanguage } = useLanguage()

  return {
    t,
    locale,
    changeLanguage,
    // Helper function for pluralization
    tPlural: (key: string, count: number, pluralKey?: string) => {
      if (count === 1) {
        return t(key)
      }
      return t(pluralKey || `${key}_plural`)
    },
    // Helper function for interpolation
    tInterpolate: (key: string, values: Record<string, string | number>) => {
      let translation = t(key)
      Object.entries(values).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value))
      })
      return translation
    },
  }
}
