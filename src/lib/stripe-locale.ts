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
 * Get enhanced business profile parameters for different scenarios
 */
export const getEnhancedBusinessProfile = (sellerSlug: string, hasWebsite: boolean = false, websiteUrl?: string) => {
  const baseProfile = {
    product_description: 'Product sold via Neaply',
    mcc: '5399', // Computer Software Stores - adapt to your activity
    support_url: 'https://neaply.com/support',
    support_email: 'support@neaply.com',
  }

  if (hasWebsite && websiteUrl) {
    // Seller has their own website
    return {
      ...baseProfile,
      url: websiteUrl,
    }
  } else {
    // Seller only sells on Neaply - no website field
    // Stripe will show "Vous n'avez pas de site Web ? ..." with product_description
    return baseProfile
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

/**
 * Get marketplace-specific business profile (for sellers who only sell on Neaply)
 */
export const getMarketplaceBusinessProfile = (sellerSlug: string) => {
  return {
    // No url field - Stripe will use product_description
    product_description: 'Vente de produits via Neaply',
    mcc: '5399', // Computer Software Stores
    support_url: 'https://neaply.com/store/' + sellerSlug,
    support_email: 'support@neaply.com',
  }
}

/**
 * Get business profile update parameters for existing accounts
 */
export const getBusinessProfileUpdateParams = (
  sellerSlug: string,
  hasWebsite: boolean = false,
  websiteUrl?: string
) => {
  const baseProfile = {
    product_description: 'Vente de produits via Neaply',
    mcc: '5399', // Computer Software Stores
    support_url: 'https://neaply.com/support',
    support_email: 'support@neaply.com',
  }

  if (hasWebsite && websiteUrl) {
    return {
      ...baseProfile,
      url: websiteUrl,
    }
  } else {
    // For marketplace-only sellers, don't include url field
    // This will make Stripe show the "no website" option with product_description
    return baseProfile
  }
}

/**
 * Get comprehensive business profile for any scenario
 * This is the main function to use for creating/updating Stripe accounts
 */
export const getComprehensiveBusinessProfile = (
  sellerSlug: string,
  options: {
    hasWebsite?: boolean
    websiteUrl?: string
    hideWebsiteField?: boolean // Force hide website field even if URL exists
    customMcc?: string
    customSupportUrl?: string
    customSupportEmail?: string
  } = {}
) => {
  const {
    hasWebsite = false,
    websiteUrl,
    hideWebsiteField = false,
    customMcc = '5399', // Computer Software Stores
    customSupportUrl = 'https://neaply.com/support',
    customSupportEmail = 'support@neaply.com',
  } = options

  const baseProfile = {
    product_description: 'Vente de produits via Neaply',
    mcc: customMcc,
    support_url: customSupportUrl,
    support_email: customSupportEmail,
  }

  // If we want to completely hide website field or seller has no website
  if (hideWebsiteField || !hasWebsite || !websiteUrl) {
    // Don't include url field - Stripe will show "no website" option
    return baseProfile
  }

  // Include website URL for sellers with their own site
  return {
    ...baseProfile,
    url: websiteUrl,
  }
}
