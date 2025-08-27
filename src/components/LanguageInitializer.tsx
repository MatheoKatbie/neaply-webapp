'use client'

import { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export function LanguageInitializer() {
  const { locale } = useTranslation()

  useEffect(() => {
    // Update HTML lang attribute when locale changes
    document.documentElement.lang = locale

    // Also update the title and meta description if needed
    const title = document.title
    if (title && locale === 'fr') {
      // You can add French title logic here if needed
      // document.title = 'Titre en français'
    }
  }, [locale])

  return null // This component doesn't render anything
}
