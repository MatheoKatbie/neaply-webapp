'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe, Check } from 'lucide-react'

export function LanguageSelector() {
    const { locale, changeLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const languageNames = {
        en: 'English',
        fr: 'Français'
    }

    const languageFlags = {
        en: '🇺🇸',
        fr: '🇫🇷'
    }

    const locales = ['en', 'fr'] as const

    const handleLanguageChange = (newLocale: 'en' | 'fr') => {
        changeLanguage(newLocale)
        setIsOpen(false)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{languageFlags[locale]} {languageNames[locale]}</span>
                    <span className="sm:hidden">{languageFlags[locale]}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {locales.map((localeOption) => (
                    <DropdownMenuItem
                        key={localeOption}
                        onClick={() => handleLanguageChange(localeOption)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{languageFlags[localeOption]}</span>
                            <span>{languageNames[localeOption]}</span>
                        </div>
                        {locale === localeOption && (
                            <Check className="h-4 w-4 text-green-600" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
