'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enMessages from '@/i18n/locales/en.json'
import frMessages from '@/i18n/locales/fr.json'

export type Locale = 'en' | 'fr'
export const locales: Locale[] = ['en', 'fr']

interface LanguageContextType {
    locale: Locale
    messages: typeof enMessages
    changeLanguage: (newLocale: Locale) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en')
    const [messages, setMessages] = useState(enMessages)

    useEffect(() => {
        // Get locale from cookie on mount
        const savedLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale

        if (savedLocale && locales.includes(savedLocale)) {
            setLocale(savedLocale)
            setMessages(savedLocale === 'fr' ? frMessages : enMessages)
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0] as Locale
            const detectedLocale = locales.includes(browserLang) ? browserLang : 'en'
            setLocale(detectedLocale)
            setMessages(detectedLocale === 'fr' ? frMessages : enMessages)
        }
    }, [])

    const changeLanguage = (newLocale: Locale) => {
        if (newLocale === locale) return // No change needed
        
        setLocale(newLocale)
        setMessages(newLocale === 'fr' ? frMessages : enMessages)

        // Save to cookie
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`

        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
            document.documentElement.lang = newLocale
        }
    }

    const t = (key: string): string => {
        const keys = key.split('.')
        let value: any = messages

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                return key // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key
    }

    return (
        <LanguageContext.Provider value={{ locale, messages, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
