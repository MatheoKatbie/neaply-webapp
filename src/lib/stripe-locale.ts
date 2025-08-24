/**
 * Stripe Locale Utilities
 * Maps country codes to appropriate Stripe locales for internationalization
 */

export const getStripeLocaleFromCountry = (countryCode: string): string => {
  const localeMap: Record<string, string> = {
    // English-speaking countries
    US: 'en',
    GB: 'en',
    AU: 'en',
    NZ: 'en',
    IE: 'en',

    // French-speaking countries
    FR: 'fr',
    BE: 'fr', // Belgium - French

    // German-speaking countries
    DE: 'de',
    AT: 'de', // Austria
    LI: 'de', // Liechtenstein

    // Spanish-speaking countries
    ES: 'es',
    MX: 'es',
    AR: 'es',
    CO: 'es',
    PE: 'es',
    VE: 'es',
    CL: 'es',
    EC: 'es',
    GT: 'es',
    CU: 'es',
    BO: 'es',
    DO: 'es',
    HN: 'es',
    PY: 'es',
    SV: 'es',
    NI: 'es',
    CR: 'es',
    PA: 'es',
    UY: 'es',
    GQ: 'es',

    // Italian-speaking countries
    IT: 'it',
    SM: 'it', // San Marino
    VA: 'it', // Vatican City

    // Dutch-speaking countries
    NL: 'nl',

    // Portuguese-speaking countries
    PT: 'pt',
    BR: 'pt',
    AO: 'pt',
    MZ: 'pt',
    GW: 'pt',
    CV: 'pt',
    TL: 'pt',
    ST: 'pt',

    // Japanese-speaking countries
    JP: 'ja',

    // Korean-speaking countries
    KR: 'ko',

    // Chinese-speaking countries
    CN: 'zh',
    TW: 'zh',
    HK: 'zh',
    SG: 'zh',

    // Other European countries
    SE: 'sv', // Sweden
    NO: 'no', // Norway
    DK: 'da', // Denmark
    FI: 'fi', // Finland
    PL: 'pl', // Poland
    CZ: 'cs', // Czech Republic
    SK: 'sk', // Slovakia
    HU: 'hu', // Hungary
    RO: 'ro', // Romania
    BG: 'bg', // Bulgaria
    HR: 'hr', // Croatia
    SI: 'sl', // Slovenia
    EE: 'et', // Estonia
    LV: 'lv', // Latvia
    LT: 'lt', // Lithuania
    GR: 'el', // Greece
    CY: 'el', // Cyprus
    MT: 'mt', // Malta

    // Multi-language countries (prioritize most common)
    CA: 'en', // Canada - English (most common)
    CH: 'de', // Switzerland - German (most common)
  }

  return localeMap[countryCode] || 'en' // Default to English
}

/**
 * Get the appropriate Stripe account creation parameters based on country
 */
export const getStripeAccountParams = (countryCode: string, email: string, websiteUrl?: string) => {
  return {
    type: 'express' as const,
    country: countryCode,
    email,
    business_type: 'individual' as const,
    business_profile: {
      url: websiteUrl || undefined,
      mcc: '5734', // Computer Software Stores
    },
  }
}

/**
 * Get the appropriate Stripe account link parameters
 */
export const getStripeAccountLinkParams = (accountId: string, countryCode: string, baseUrl: string) => {
  const locale = getStripeLocaleFromCountry(countryCode)

  return {
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/stripe/connect/refresh`,
    return_url: `${baseUrl}/dashboard/stripe/connect/return`,
    type: 'account_onboarding' as const,
    collect: 'eventually_due' as const,
  }
}

/**
 * Add locale parameter to Stripe onboarding URL
 * This is the most reliable way to force Stripe to use a specific language
 */
export const addLocaleToStripeOnboardingUrl = (url: string, countryCode: string): string => {
  const locale = getStripeLocaleFromCountry(countryCode)
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}locale=${locale}`
}

/**
 * Add locale parameter to existing Stripe URLs
 */
export const addLocaleToStripeUrl = (url: string, countryCode: string): string => {
  const locale = getStripeLocaleFromCountry(countryCode)
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}locale=${locale}`
}
