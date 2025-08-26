// Mapping of tag names to their logo images
export const TAG_LOGOS: Record<string, string> = {
    // Platform logos (existing)
    'n8n': '/images/company-logo/n8n-logo.png',
    'zapier': '/images/company-logo/zapier-logo.png',
    'make': '/images/company-logo/make-logo.png',
    'airtable': '/images/company-logo/airtable-logo.png',

    // Cloud providers
    'aws': '/images/company-logo/aws-logo.png',
    'azure': '/images/company-logo/azure-logo.png',
    'google-cloud': '/images/company-logo/google-cloud-logo.png',
    'gcp': '/images/company-logo/google-cloud-logo.png',

    // AI/ML services
    'openai': '/images/company-logo/openai-logo.png',
    'chatgpt': '/images/company-logo/openai-logo.png',
    'anthropic': '/images/company-logo/anthropic-logo.png',
    'claude': '/images/company-logo/anthropic-logo.png',
    'gemini': '/images/company-logo/google-ai-logo.png',
    'ai-ml': '/images/company-logo/openai-logo.png',

    // Communication platforms
    'slack': '/images/company-logo/slack-logo.png',
    'discord': '/images/company-logo/discord-logo.png',
    'teams': '/images/company-logo/microsoft-teams-logo.png',
    'whatsapp': '/images/company-logo/whatsapp-logo.png',
    'telegram': '/images/company-logo/telegram-logo.png',

    // Social media
    'twitter': '/images/company-logo/twitter-logo.png',
    'linkedin': '/images/company-logo/linkedin-logo.png',
    'facebook': '/images/company-logo/facebook-logo.png',
    'instagram': '/images/company-logo/instagram-logo.png',
    'youtube': '/images/company-logo/youtube-logo.png',
    'tiktok': '/images/company-logo/tiktok-logo.png',

    // Productivity tools
    'notion': '/images/company-logo/notion-logo.png',
    'trello': '/images/company-logo/trello-logo.png',
    'asana': '/images/company-logo/asana-logo.png',
    'monday': '/images/company-logo/monday-logo.png',
    'jira': '/images/company-logo/jira-logo.png',
    'confluence': '/images/company-logo/confluence-logo.png',
    'google-sheets': '/images/company-logo/google-sheets-logo.png',
    'excel': '/images/company-logo/excel-logo.png',

    // CRM & Business tools
    'salesforce': '/images/company-logo/salesforce-logo.png',
    'hubspot': '/images/company-logo/hubspot-logo.png',
    'pipedrive': '/images/company-logo/pipedrive-logo.png',
    'zoho': '/images/company-logo/zoho-logo.png',

    // E-commerce
    'shopify': '/images/company-logo/shopify-logo.png',
    'woocommerce': '/images/company-logo/woocommerce-logo.png',
    'stripe': '/images/company-logo/stripe-logo.png',
    'paypal': '/images/company-logo/paypal-logo.png',

    // Development tools
    'github': '/images/company-logo/github-logo.png',
    'gitlab': '/images/company-logo/gitlab-logo.png',
    'bitbucket': '/images/company-logo/bitbucket-logo.png',
    'vercel': '/images/company-logo/vercel-logo.png',
    'netlify': '/images/company-logo/netlify-logo.png',

    // Database & Storage
    'mongodb': '/images/company-logo/mongodb-logo.png',
    'postgresql': '/images/company-logo/postgresql-logo.png',
    'mysql': '/images/company-logo/mysql-logo.png',
    'firebase': '/images/company-logo/firebase-logo.png',
    'supabase': '/images/company-logo/supabase-logo.png',
    'redis': '/images/company-logo/redis-logo.png',

    // Analytics & Monitoring
    'google-analytics': '/images/company-logo/google-analytics-logo.png',
    'mixpanel': '/images/company-logo/mixpanel-logo.png',
    'amplitude': '/images/company-logo/amplitude-logo.png',
    'sentry': '/images/company-logo/sentry-logo.png',

    // Email & Marketing
    'mailchimp': '/images/company-logo/mailchimp-logo.png',
    'sendgrid': '/images/company-logo/sendgrid-logo.png',
    'klaviyo': '/images/company-logo/klaviyo-logo.png',
    'convertkit': '/images/company-logo/convertkit-logo.png',
    'gmail': '/images/company-logo/gmail-logo.png',

    // Video & Media
    'vimeo': '/images/company-logo/vimeo-logo.png',
    'twitch': '/images/company-logo/twitch-logo.png',
    'spotify': '/images/company-logo/spotify-logo.png',

    // File storage
    'dropbox': '/images/company-logo/dropbox-logo.png',
    'google-drive': '/images/company-logo/google-drive-logo.png',
    'onedrive': '/images/company-logo/onedrive-logo.png',
    'box': '/images/company-logo/box-logo.png',

    // Automation & Integration
    'ifttt': '/images/company-logo/ifttt-logo.png',

    // Container & Orchestration
    'docker': '/images/company-logo/docker-logo.png',
    'kubernetes': '/images/company-logo/kubernetes-logo.png',

}

// Function to get logo for a tag
export function getTagLogo(tagName: string): string | null {
    const normalizedName = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')

    // Direct match
    if (TAG_LOGOS[normalizedName]) {
        return TAG_LOGOS[normalizedName]
    }

    // Try to find partial matches
    for (const [key, logo] of Object.entries(TAG_LOGOS)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return logo
        }
    }

    return null
}

// Function to get logo for a tag with fallback
export function getTagLogoWithFallback(tagName: string): string {
    return getTagLogo(tagName) || '/images/company-logo/default-tag-logo.png'
}
