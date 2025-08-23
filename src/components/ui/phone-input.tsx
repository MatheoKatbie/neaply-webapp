'use client'

import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'
import type { SelectMenuOption } from '@/types/countries'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface PhoneInputComponentProps {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PhoneInputComponent({
  value,
  onChange,
  placeholder = 'Enter phone number',
  className,
  disabled = false,
}: PhoneInputComponentProps) {
  const [selectedCountry, setSelectedCountry] = useState<SelectMenuOption>(
    COUNTRIES.find((country) => country.value === 'FR') || COUNTRIES[0]
  )
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countrySelectOpen, setCountrySelectOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const countrySelectRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  // Initialize with default country (France)
  useEffect(() => {
    if (value && !isInitialized.current) {
      // Try to parse existing phone number to extract country and number
      const parsed = parsePhoneNumber(value)
      if (parsed) {
        setSelectedCountry(parsed.country)
        setPhoneNumber(parsed.number)
      } else {
        setPhoneNumber(value)
      }
      isInitialized.current = true
    }
  }, [value])

  // Memoize the onChange callback to prevent infinite loops
  const notifyParent = useCallback(
    (fullNumber: string) => {
      onChange(fullNumber || undefined)
    },
    [onChange]
  )

  // Update parent when phone number changes - but only when user actually changes it
  useEffect(() => {
    if (isInitialized.current) {
      const fullNumber = phoneNumber ? `${selectedCountry.phonePrefix}${phoneNumber}` : ''
      notifyParent(fullNumber)
    }
  }, [selectedCountry, phoneNumber, notifyParent])

  // Close country select when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(event.target as Node)) {
        setCountrySelectOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parsePhoneNumber = (phone: string): { country: SelectMenuOption; number: string } | null => {
    for (const country of COUNTRIES) {
      if (phone.startsWith(country.phonePrefix)) {
        const number = phone.substring(country.phonePrefix.length)
        return { country, number }
      }
    }
    return null
  }

  const handleCountrySelect = (country: SelectMenuOption) => {
    setSelectedCountry(country)
    setCountrySelectOpen(false)
    setSearchTerm('')
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '') // Remove non-digits
    setPhoneNumber(input)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter countries based on search term
  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.phonePrefix.includes(searchTerm) ||
      country.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={cn('relative w-full', className)}>
      <div className="flex w-full">
        {/* Country Select */}
        <div ref={countrySelectRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setCountrySelectOpen(!countrySelectOpen)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1 px-2 py-3 border border-r-0 border-border rounded-l-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-0',
              disabled && 'bg-muted cursor-not-allowed'
            )}
          >
            <img
              alt={selectedCountry.value}
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedCountry.value}.svg`}
              className="w-4 h-3 rounded-sm flex-shrink-0"
            />
            <span className="text-xs font-medium whitespace-nowrap">{selectedCountry.phonePrefix}</span>
            <svg
              className={cn('w-3 h-3 transition-transform flex-shrink-0', countrySelectOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Country Dropdown */}
          {countrySelectOpen && (
            <div className="absolute top-full left-0 z-50 w-64 max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg">
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No countries found</div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.value}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-background focus:bg-background focus:outline-none',
                        selectedCountry.value === country.value && 'bg-blue-50'
                      )}
                    >
                      <img
                        alt={country.value}
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.value}.svg`}
                        className="w-4 h-3 rounded-sm"
                      />
                      <span className="flex-1 text-left">{country.title}</span>
                      <span className="text-muted-foreground text-xs">{country.phonePrefix}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-0 px-3 py-2 border border-border rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            disabled && 'bg-muted cursor-not-allowed'
          )}
        />
      </div>
    </div>
  )
}
