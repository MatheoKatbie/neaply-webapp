'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface TransProps {
  i18nKey: string
  values?: Record<string, string | number>
  fallback?: string
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export function Trans({ i18nKey, values, fallback, className, as: Component = 'span' }: TransProps) {
  const { t, tInterpolate } = useTranslation()

  let translation: string

  try {
    if (values && Object.keys(values).length > 0) {
      translation = tInterpolate(i18nKey, values)
    } else {
      translation = t(i18nKey)
    }

    // If translation is the same as the key, use fallback
    if (translation === i18nKey && fallback) {
      translation = fallback
    }
  } catch (error) {
    // If there's an error, use fallback or the key itself
    translation = fallback || i18nKey
  }

  return React.createElement(Component, { className }, translation)
}
