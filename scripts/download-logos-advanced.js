const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const LOGOS_DIR = path.join(__dirname, '../public/images/company-logo');
const LOGO_SIZE = 64; // Taille en pixels pour les logos

// Mapping des entreprises avec leurs domaines pour l'API Clearbit
const COMPANY_DOMAINS = {
    // Platforms (existing)
    'n8n': 'n8n.io',
    'zapier': 'zapier.com',
    'make': 'make.com',
    'airtable': 'airtable.com',

    // Cloud providers
    'aws': 'amazonaws.com',
    'azure': 'azure.microsoft.com',
    'google-cloud': 'cloud.google.com',
    'gcp': 'cloud.google.com',

    // AI/ML services
    'openai': 'openai.com',
    'chatgpt': 'openai.com',
    'anthropic': 'anthropic.com',
    'claude': 'anthropic.com',
    'gemini': 'ai.google',
    'ai-ml': 'openai.com', // Fallback to OpenAI

    // Communication platforms
    'slack': 'slack.com',
    'discord': 'discord.com',
    'teams': 'teams.microsoft.com',
    'whatsapp': 'whatsapp.com',
    'telegram': 'telegram.org',

    // Social media
    'twitter': 'twitter.com',
    'linkedin': 'linkedin.com',
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'youtube': 'youtube.com',
    'tiktok': 'tiktok.com',

    // Productivity tools
    'notion': 'notion.so',
    'trello': 'trello.com',
    'asana': 'asana.com',
    'monday': 'monday.com',
    'jira': 'atlassian.com',
    'confluence': 'atlassian.com',
    'google-sheets': 'sheets.google.com',
    'excel': 'microsoft.com',

    // CRM & Business tools
    'salesforce': 'salesforce.com',
    'hubspot': 'hubspot.com',
    'pipedrive': 'pipedrive.com',
    'zoho': 'zoho.com',

    // E-commerce
    'shopify': 'shopify.com',
    'woocommerce': 'woocommerce.com',
    'stripe': 'stripe.com',
    'paypal': 'paypal.com',

    // Development tools
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'bitbucket': 'bitbucket.org',
    'vercel': 'vercel.com',
    'netlify': 'netlify.com',

    // Database & Storage
    'mongodb': 'mongodb.com',
    'postgresql': 'postgresql.org',
    'mysql': 'mysql.com',
    'firebase': 'firebase.google.com',
    'supabase': 'supabase.com',
    'redis': 'redis.io',

    // Analytics & Monitoring
    'google-analytics': 'analytics.google.com',
    'mixpanel': 'mixpanel.com',
    'amplitude': 'amplitude.com',
    'sentry': 'sentry.io',

    // Email & Marketing
    'mailchimp': 'mailchimp.com',
    'sendgrid': 'sendgrid.com',
    'klaviyo': 'klaviyo.com',
    'convertkit': 'convertkit.com',
    'gmail': 'gmail.com',

    // Video & Media
    'vimeo': 'vimeo.com',
    'twitch': 'twitch.tv',
    'spotify': 'spotify.com',

    // File storage
    'dropbox': 'dropbox.com',
    'google-drive': 'drive.google.com',
    'onedrive': 'onedrive.live.com',
    'box': 'box.com',

    // Automation & Integration
    'ifttt': 'ifttt.com',

    // Container & Orchestration
    'docker': 'docker.com',
    'kubernetes': 'kubernetes.io',

    // APIs & Data formats
    'rest-api': 'restfulapi.net',
    'graphql': 'graphql.org',
    'json': 'json.org',
    'xml': 'w3.org',
    'csv': 'csv.org',
    'pdf': 'adobe.com',

    // Processing
    'image-processing': 'opencv.org',
    'text-processing': 'nltk.org',

    // Scheduling & Real-time
    'scheduled': 'cron-job.org',
    'real-time': 'socket.io',
    'batch-processing': 'apache.org',

    // Quality & Performance
    'error-handling': 'sentry.io',
    'testing': 'jestjs.io',
    'debugging': 'debugger.com',
    'performance': 'web.dev',
    'scalable': 'kubernetes.io',

    // Development approaches
    'low-code': 'bubble.io',
    'no-code': 'bubble.io',

    // Business types
    'enterprise': 'salesforce.com',
    'startup': 'ycombinator.com',
    'saas': 'stripe.com',
    'b2b': 'salesforce.com',
    'b2c': 'shopify.com',

    // Difficulty levels & Status
    'beginner': 'codecademy.com',
    'advanced': 'leetcode.com',
    'expert': 'hackerrank.com',
    'free': 'github.com',
    'premium': 'stripe.com',
    'popular': 'trending.com',
    'new': 'producthunt.com',
    'updated': 'github.com',
    'hot': 'trending.com',
    'trending': 'trending.com',
};

// URLs alternatives pour les logos (si l'API échoue)
const FALLBACK_LOGOS = {
    'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    'azure': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
    'google-cloud': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Cloud_logo.svg',
    'openai': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'github': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    'stripe': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Stripe_logo%2C_revised_2016.svg',
    'shopify': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo.svg',
    'notion': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    'discord': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Discord_logo.svg',
};

// Fonction pour télécharger depuis l'API Clearbit
function downloadFromClearbit(company, domain) {
    return new Promise((resolve, reject) => {
        const url = `https://logo.clearbit.com/${domain}?size=${LOGO_SIZE}`;

        const filepath = path.join(LOGOS_DIR, `${company}-logo.png`);
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Clearbit API failed for ${company}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Fonction pour télécharger depuis une URL de fallback
function downloadFromFallback(company, url) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(LOGOS_DIR, `${company}-logo.png`);
        const file = fs.createWriteStream(filepath);

        const protocol = url.startsWith('https:') ? https : http;

        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Fallback failed for ${company}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Fonction pour créer le répertoire s'il n'existe pas
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Fonction pour télécharger tous les logos
async function downloadAllLogos() {
    console.log('🚀 Starting advanced logo download...');

    ensureDirectoryExists(LOGOS_DIR);

    const results = {
        success: [],
        failed: []
    };

    for (const [company, domain] of Object.entries(COMPANY_DOMAINS)) {
        try {
            console.log(`📥 Downloading ${company} logo from Clearbit...`);
            await downloadFromClearbit(company, domain);
            results.success.push({ company, source: 'Clearbit' });
            console.log(`✅ Downloaded ${company} logo from Clearbit`);
        } catch (error) {
            console.log(`⚠️  Clearbit failed for ${company}, trying fallback...`);

            // Essayer le fallback
            if (FALLBACK_LOGOS[company]) {
                try {
                    await downloadFromFallback(company, FALLBACK_LOGOS[company]);
                    results.success.push({ company, source: 'Fallback' });
                    console.log(`✅ Downloaded ${company} logo from fallback`);
                } catch (fallbackError) {
                    console.error(`❌ Failed to download ${company} logo:`, fallbackError.message);
                    results.failed.push({ company, error: fallbackError.message });
                }
            } else {
                console.error(`❌ No fallback available for ${company}`);
                results.failed.push({ company, error: 'No fallback available' });
            }
        }
    }

    return results;
}

// Fonction pour créer un logo par défaut
function createDefaultLogo() {
    const defaultLogoPath = path.join(LOGOS_DIR, 'default-tag-logo.png');

    if (!fs.existsSync(defaultLogoPath)) {
        console.log('🎨 Creating default logo...');

        // Créer un SVG simple comme logo par défaut
        const svgContent = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="#f3f4f6"/>
  <text x="32" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#6b7280">#</text>
</svg>`;

        fs.writeFileSync(defaultLogoPath, Buffer.from(svgContent, 'utf8'));
        console.log('✅ Created default logo');
    }
}

// Fonction pour nettoyer les fichiers existants
function cleanupExistingLogos() {
    console.log('🧹 Cleaning up existing logos...');

    if (fs.existsSync(LOGOS_DIR)) {
        const files = fs.readdirSync(LOGOS_DIR);
        files.forEach(file => {
            if (file.endsWith('-logo.png') || file.endsWith('-logo.svg')) {
                const filepath = path.join(LOGOS_DIR, file);
                fs.unlinkSync(filepath);
                console.log(`🗑️  Removed ${file}`);
            }
        });
    }
}

// Fonction principale
async function main() {
    try {
        console.log('⚠️  This script will download company logos using Clearbit API and fallbacks');
        console.log('📁 Logos will be saved to:', LOGOS_DIR);
        console.log('🔗 Using Clearbit Logo API: https://logo.clearbit.com/');

        cleanupExistingLogos();

        const results = await downloadAllLogos();
        createDefaultLogo();

        // Afficher le résumé
        console.log('\n📊 Download Summary:');
        console.log(`✅ Successfully downloaded: ${results.success.length} logos`);
        console.log(`❌ Failed downloads: ${results.failed.length} logos`);

        if (results.success.length > 0) {
            console.log('\n✅ Successfully downloaded logos:');
            results.success.forEach(({ company, source }) => {
                console.log(`  - ${company} (${source})`);
            });
        }

        if (results.failed.length > 0) {
            console.log('\n❌ Failed downloads:');
            results.failed.forEach(({ company, error }) => {
                console.log(`  - ${company}: ${error}`);
            });
        }

        console.log('\n🎉 Logo download completed!');
        console.log('💡 You can manually add missing logos to the FALLBACK_LOGOS object');

    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    main();
}

module.exports = {
    downloadAllLogos,
    createDefaultLogo,
    cleanupExistingLogos,
    COMPANY_DOMAINS,
    FALLBACK_LOGOS
};
