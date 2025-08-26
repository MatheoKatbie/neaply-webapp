'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/hooks/useTranslation'
import { Globe, Check } from 'lucide-react'

export function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languageNames = {
    en: 'English',
    fr: 'Français',
  }

  const languageFlags = {
    en: '🇺🇸',
    fr: '🇫🇷',
  }

  const locales = ['en', 'fr'] as const

  const handleLanguageChange = (newLocale: 'en' | 'fr') => {
    changeLanguage(newLocale)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[locale]}</span>
          <span className="sm:hidden">{languageFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{languageNames[lang]}</span>
            </div>
            {locale === lang && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
