# 🔒 RAPPORT D'AUDIT DE SÉCURITÉ - neaply

**Date de l'audit :** 1er novembre 2025  
**Version de l'application :** Dev Branch  
**Auditeur :** Analyse de sécurité automatisée  
**Périmètre :** Application complète (Frontend, Backend, API, Base de données)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Score de Sécurité Global : **7/10**

- ✅ **3 failles critiques** identifiées
- ⚠️ **5 vulnérabilités moyennes** détectées
- 📋 **7 recommandations** d'amélioration

**Verdict :** L'application présente une architecture solide avec de bonnes pratiques de sécurité, mais plusieurs points critiques doivent être corrigés avant le déploiement en production.

---

## ✅ POINTS FORTS IDENTIFIÉS

### 1. Authentification Robuste
- ✅ Utilisation de Supabase Auth avec gestion appropriée des sessions
- ✅ Middleware bien configuré pour la protection des routes (`src/middleware.ts`)
- ✅ Vérification cohérente de l'authentification dans toutes les routes API
- ✅ Séparation correcte entre routes publiques et protégées
- ✅ Support OAuth avec gestion des métadonnées utilisateur

### 2. Protection contre l'Injection SQL
- ✅ Utilisation exclusive de Prisma ORM (aucune requête SQL brute détectée)
- ✅ Les paramètres sont automatiquement échappés et sécurisés par Prisma
- ✅ Utilisation de transactions pour l'intégrité des données
- ✅ Pas d'interpolation de chaînes dans les requêtes

### 3. Validation des Entrées
- ✅ Utilisation systématique de Zod pour la validation dans les routes API
- ✅ Schémas de validation bien définis et stricts
- ✅ Messages d'erreur appropriés pour les validations échouées
- ✅ Validation des UUIDs avant les requêtes en base de données

### 4. Sécurité des Paiements Stripe
- ✅ Vérification des webhooks avec signatures (`stripe.webhooks.constructEvent`)
- ✅ Utilisation de transactions Prisma pour l'atomicité des paiements
- ✅ Stripe Connect bien configuré avec application fees
- ✅ Vérification du statut des comptes vendeurs avant les paiements
- ✅ Gestion des remboursements et des échecs de paiement

### 5. Chiffrement des Données
- ✅ Chiffrement AES-256-GCM pour les workflows sensibles
- ✅ Utilisation d'IV aléatoires et d'auth tags
- ✅ Fonctions de chiffrement/déchiffrement bien implémentées

### 6. Audit Logs
- ✅ Système d'audit logs complet pour tracer les actions importantes
- ✅ Logs pour les créations de commandes, changements de statut, etc.

---

## 🚨 FAILLES CRITIQUES IDENTIFIÉES

### 1. ⚠️⚠️⚠️ EXPOSITION DE LA CLÉ DE CHIFFREMENT (CRITIQUE)

**Fichier :** `src/lib/encryption.ts:4`

```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-32-chars-long'
```

**Problème :**
- Clé de chiffrement par défaut en clair dans le code source
- Si `ENCRYPTION_KEY` n'est pas définie en production, tous les workflows chiffrés utilisent cette clé connue
- N'importe qui ayant accès au code peut déchiffrer tous les workflows

**Impact :**
- 🔴 **Critique** : Compromission totale de la confidentialité des workflows
- Violation potentielle de la propriété intellectuelle des vendeurs
- Perte de confiance des utilisateurs

**Solution recommandée :**

```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('FATAL: ENCRYPTION_KEY must be set in environment variables')
}

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('FATAL: ENCRYPTION_KEY must be exactly 32 characters')
}
```

**Actions immédiates :**
1. Générer une nouvelle clé forte : `openssl rand -hex 32`
2. Configurer la variable d'environnement sur tous les environnements
3. Envisager une rotation des clés pour les données existantes

---

### 2. ⚠️⚠️ CONTRÔLE D'ACCÈS INSUFFISANT SUR LES FICHIERS (HAUTE)

**Fichier :** `src/app/api/upload/hero-image/route.ts:90-92`

```typescript
// Only allow deletion if filename belongs to current user
if (!fileName.includes(user.id)) {
  return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
}
```

**Problème :**
- Vérification faible avec `includes()` 
- Un attaquant pourrait supprimer des fichiers dont le nom contient l'UUID d'un autre utilisateur
- Exemple : `malicious-file-{victim-uuid}-payload.jpg`

**Impact :**
- 🟠 **Haute** : Suppression non autorisée de fichiers
- Déni de service potentiel
- Perte de données utilisateurs

**Solution recommandée :**

```typescript
// Verify file ownership with strict prefix check
if (!fileName.startsWith(`${user.id}-`)) {
  console.warn(`Unauthorized deletion attempt: user ${user.id} tried to delete ${fileName}`)
  return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 })
}
```

---

### 3. ⚠️⚠️ ABSENCE DE RATE LIMITING (HAUTE)

**Problème :**
Aucune limite de taux sur les routes API critiques :
- `/api/auth/login-with-2fa` - Force brute sur 2FA
- `/api/auth/check-2fa-required` - Énumération d'utilisateurs
- `/api/checkout/*` - Spam de tentatives de paiement
- `/api/workflows` - Spam de création de workflows
- `/api/upload/*` - Abus de stockage
- `/api/reviews` - Spam d'avis

**Impact :**
- 🟠 **Haute** : Attaques par force brute
- Déni de service (DoS)
- Abus de ressources serveur et de stockage
- Coûts d'infrastructure accrus

**Solution recommandée :**

Implémenter un rate limiting avec `@upstash/ratelimit` :

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = {
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requêtes / 15 min
    analytics: true,
  }),
  api: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requêtes / min
    analytics: true,
  }),
  upload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads / heure
    analytics: true,
  }),
}

// Usage dans les routes API
const { success } = await ratelimit.auth.limit(user.id)
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

---

## ⚠️ VULNÉRABILITÉS MOYENNES

### 4. ⚠️ VALIDATION DES UPLOADS INSUFFISANTE (MOYENNE)

**Fichier :** `src/app/api/upload/hero-image/route.ts:32-34`

```typescript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Only JPG, PNG, GIF, and WebP files are allowed' }, { status: 400 })
}
```

**Problème :**
- Vérification uniquement basée sur le MIME type
- Le MIME type peut être facilement forgé
- Pas de vérification des magic bytes (signature du fichier)
- Pas de vérification de l'extension réelle

**Impact :**
- 🟡 **Moyenne** : Upload de fichiers malveillants déguisés en images
- Potentiel XSS si les images ne sont pas servies avec les bons headers
- Stockage de fichiers non-images

**Solution recommandée :**

```typescript
import { fileTypeFromBuffer } from 'file-type'

// Validate MIME type
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}

// Validate file extension
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
if (!allowedExtensions.includes(fileExt)) {
  return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
}

// Validate magic bytes
const buffer = await file.arrayBuffer()
const fileType = await fileTypeFromBuffer(Buffer.from(buffer))
if (!fileType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType.mime)) {
  return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 })
}
```

---

### 5. ⚠️ FUITE D'INFORMATIONS DANS LES ERREURS (MOYENNE)

**Fichiers multiples :**
- `src/app/api/user/route.ts:61-62`
- `src/app/api/seller/route.ts:165-166`
- Autres routes API

```typescript
} catch (error) {
  console.error('Erreur API user:', error)
  return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
}
```

**Problème :**
- Les erreurs détaillées sont loguées mais pourraient être exposées
- Pas de distinction entre environnement de dev et production
- Les messages d'erreur pourraient révéler la structure de la base de données

**Impact :**
- 🟡 **Moyenne** : Fuite d'informations techniques
- Aide les attaquants à cartographier l'application
- Violation potentielle de la confidentialité

**Solution recommandée :**

```typescript
// lib/error-handler.ts
export function handleApiError(error: unknown, context: string) {
  const errorId = crypto.randomUUID()
  
  // Log détaillé côté serveur
  console.error(`[${errorId}] Error in ${context}:`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  })

  // Message générique pour le client
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'Internal server error',
      errorId, // Pour le support client
    }
  } else {
    // En dev, on peut retourner plus de détails
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorId,
      stack: error instanceof Error ? error.stack : undefined,
    }
  }
}

// Usage
} catch (error) {
  const errorResponse = handleApiError(error, 'GET /api/user')
  return NextResponse.json(errorResponse, { status: 500 })
}
```

---

### 6. ⚠️ ABSENCE DE CONTENT SECURITY POLICY (MOYENNE)

**Problème :**
- Pas de headers de sécurité HTTP configurés
- Pas de CSP (Content Security Policy)
- Pas de protection contre le clickjacking
- Pas de protection contre le sniffing MIME

**Impact :**
- 🟡 **Moyenne** : Vulnérabilités XSS potentielles
- Clickjacking possible
- Man-in-the-middle facilité

**Solution recommandée :**

Ajouter dans `next.config.ts` :

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
              "frame-src 'self' https://accounts.google.com https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

---

### 7. ⚠️ WEBHOOK SANS IDEMPOTENCE STRICTE (MOYENNE)

**Fichier :** `src/app/api/webhooks/stripe/route.ts:89-96`

**Problème :**
- Bien que le code vérifie si la commande est déjà payée (ligne 191), il manque une vérification explicite basée sur l'ID de l'événement Stripe
- Stripe peut renvoyer le même événement plusieurs fois en cas de timeout
- Risque de double traitement si la vérification du statut échoue

**Impact :**
- 🟡 **Moyenne** : Possible double comptabilisation des ventes
- Incohérences dans les statistiques
- Problèmes comptables

**Solution recommandée :**

```typescript
// Ajouter une table pour tracker les événements traités
model ProcessedStripeEvent {
  id        String   @id // Stripe event ID
  type      String
  processed Boolean  @default(true)
  createdAt DateTime @default(now())

  @@index([id])
}

// Dans le webhook handler
export async function POST(request: NextRequest) {
  try {
    // ... vérification de signature ...

    // Vérifier si l'événement a déjà été traité
    const existingEvent = await prisma.processedStripeEvent.findUnique({
      where: { id: event.id }
    })

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: true })
    }

    // Traiter l'événement
    await handleEvent(event)

    // Marquer comme traité
    await prisma.processedStripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        processed: true,
      }
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    // ...
  }
}
```

---

### 8. ⚠️ MANQUE DE VÉRIFICATION DE PROPRIÉTÉ (MOYENNE)

**Fichier :** `src/app/api/workflows/[id]/download/route.ts:27-38`

**Points positifs :**
- ✅ Vérification que l'utilisateur a acheté le workflow avant le téléchargement

**Points à améliorer :**
- Vérifier dans toutes les routes de modification de workflows (`PUT`, `DELETE`) que seul le propriétaire ou un admin peut effectuer l'action
- Ajouter des logs d'audit pour les accès aux téléchargements

**Solution recommandée :**

```typescript
// lib/authorization.ts
export async function canModifyWorkflow(userId: string, workflowId: string): Promise<boolean> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { sellerId: true }
  })

  if (!workflow) return false

  // Check ownership
  if (workflow.sellerId === userId) return true

  // Check admin status
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  return user?.isAdmin ?? false
}

// Usage dans les routes
const canModify = await canModifyWorkflow(user.id, workflowId)
if (!canModify) {
  // Log tentative d'accès non autorisé
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'unauthorized_workflow_access',
      entityType: 'workflow',
      entityId: workflowId,
      metadata: { ip: request.headers.get('x-forwarded-for') }
    }
  })
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

### 9. ⚠️ GESTION DES SESSIONS CÔTÉ CLIENT (FAIBLE)

**Fichier :** `src/hooks/useAuth.tsx`

**Problème actuel :**
- Les données utilisateur sensibles sont stockées dans l'état React
- Dépendance sur Supabase pour la gestion sécurisée des cookies

**Recommandation :**
- ✅ Vérifier que les cookies Supabase sont bien configurés en `httpOnly`
- ✅ S'assurer que les tokens ne sont jamais exposés au localStorage
- ⚠️ Implémenter une rotation automatique des tokens

**Vérification à effectuer :**

```typescript
// Dans supabase.ts, vérifier la configuration
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: {
        // S'assurer que le storage est sécurisé
        getItem: (key) => {
          // Vérifier qu'on utilise bien les cookies et pas localStorage
        }
      }
    }
  }
)
```

---

## 📋 RECOMMANDATIONS ADDITIONNELLES

### 10. Gestion des Secrets

**État actuel :**
- ✅ Les secrets utilisent `process.env`
- ✅ Pas de secrets hardcodés (sauf la clé de chiffrement de fallback)

**Améliorations recommandées :**

```typescript
// lib/config.ts - Validation des variables d'environnement au démarrage
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ENCRYPTION_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const

export function validateEnvVars() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }

  // Validate format
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters')
  }

  console.log('✅ All required environment variables are set')
}

// Dans app/layout.tsx ou middleware
validateEnvVars()
```

---

### 11. Audit Logs Enrichis

**État actuel :**
- ✅ Bonne utilisation des audit logs dans plusieurs endroits

**Améliorations recommandées :**

Ajouter des logs pour les actions sensibles manquantes :
- ✅ Changements de prix de workflows
- ✅ Modifications de statut de workflow (draft → published)
- ✅ Accès aux téléchargements de workflows
- ✅ Tentatives d'accès non autorisés
- ✅ Modifications de profils vendeurs
- ✅ Changements de méthodes de paiement

```typescript
// Exemple d'audit log enrichi
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'workflow.price_changed',
    entityType: 'workflow',
    entityId: workflowId,
    metadata: {
      oldPrice: oldPriceCents,
      newPrice: newPriceCents,
      currency: workflow.currency,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    }
  }
})
```

---

### 12. Protection CSRF

**État actuel :**
- ✅ Next.js gère nativement la protection CSRF pour les forms

**Recommandations :**
- Vérifier que tous les forms utilisent les méthodes Next.js appropriées
- Ajouter des tokens CSRF explicites pour les opérations critiques
- Implémenter la vérification de l'origine pour les requêtes sensibles

```typescript
// Middleware pour vérifier l'origine
export function verifyOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  if (!origin) {
    // Autoriser les requêtes sans origine (navigateur, curl, etc.)
    return true
  }
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    `https://${host}`,
  ]
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed))
}
```

---

### 13. Chiffrement des Données Sensibles

**État actuel :**
- ✅ Les workflows sont chiffrés avec AES-256-GCM

**Recommandations supplémentaires :**

Considérer le chiffrement des données suivantes :
- ⚠️ Numéros de téléphone des vendeurs (RGPD)
- ⚠️ Adresses email de support personnalisées
- ⚠️ Métadonnées de paiement sensibles
- ⚠️ Notes privées des vendeurs

```typescript
// lib/sensitive-data-encryption.ts
import crypto from 'crypto'

export function encryptPersonalData(data: string): string {
  // Utiliser une clé dédiée pour les données personnelles
  const key = process.env.PERSONAL_DATA_ENCRYPTION_KEY!
  // ... implémentation similaire à encryption.ts
}

// Dans le schema Prisma
model SellerProfile {
  // ...
  phoneNumberEncrypted String? // Stocker chiffré
  // ...
}
```

---

### 14. Gestion Avancée des Erreurs Prisma

**Problème :**
Plusieurs endroits où les erreurs Prisma sont loguées mais pas gérées spécifiquement

**Codes d'erreur Prisma importants :**
- `P2002` - Contrainte unique violée
- `P2025` - Enregistrement non trouvé
- `P2003` - Contrainte de clé étrangère violée
- `P2024` - Timeout de connexion

**Solution recommandée :**

```typescript
// lib/prisma-errors.ts
import { Prisma } from '@prisma/client'

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[]
        return {
          status: 409,
          error: 'Conflict',
          message: `A record with this ${target?.join(', ')} already exists`,
        }
      
      case 'P2025':
        // Record not found
        return {
          status: 404,
          error: 'Not Found',
          message: 'The requested resource was not found',
        }
      
      case 'P2003':
        // Foreign key constraint failed
        return {
          status: 400,
          error: 'Bad Request',
          message: 'Invalid reference to related resource',
        }
      
      default:
        console.error('Unhandled Prisma error:', error.code)
        return {
          status: 500,
          error: 'Internal Server Error',
          message: 'An unexpected database error occurred',
        }
    }
  }
  
  // Fallback pour les erreurs non-Prisma
  return {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  }
}

// Usage dans les routes
} catch (error) {
  const errorResponse = handlePrismaError(error)
  return NextResponse.json(
    { error: errorResponse.error, message: errorResponse.message },
    { status: errorResponse.status }
  )
}
```

---

### 15. Rotation des Clés de Chiffrement

**Recommandation avancée :**

Implémenter un système de rotation de clés pour les données chiffrées :

```typescript
// lib/key-rotation.ts
interface KeyVersion {
  version: number
  key: string
  createdAt: Date
  deprecatedAt?: Date
}

const KEY_VERSIONS: KeyVersion[] = [
  {
    version: 1,
    key: process.env.ENCRYPTION_KEY_V1!,
    createdAt: new Date('2025-01-01'),
    deprecatedAt: new Date('2025-06-01'),
  },
  {
    version: 2,
    key: process.env.ENCRYPTION_KEY_V2!,
    createdAt: new Date('2025-06-01'),
  },
]

export function encryptWithVersion(data: any): { encrypted: string, version: number } {
  const latestKey = KEY_VERSIONS[KEY_VERSIONS.length - 1]
  return {
    encrypted: encryptWithKey(data, latestKey.key),
    version: latestKey.version,
  }
}

export function decryptWithVersion(encrypted: string, version: number): any {
  const key = KEY_VERSIONS.find(k => k.version === version)
  if (!key) throw new Error('Unknown key version')
  return decryptWithKey(encrypted, key.key)
}

// Ajouter le numéro de version dans WorkflowVersion
model WorkflowVersion {
  // ...
  encryptionKeyVersion Int @default(1)
  // ...
}
```

---

## 📊 MATRICE DE RISQUES

| # | Vulnérabilité | Probabilité | Impact | Priorité | Effort |
|---|---------------|-------------|--------|----------|--------|
| 1 | Clé de chiffrement exposée | Haute | Critique | P0 | Faible |
| 2 | Contrôle d'accès fichiers | Moyenne | Haute | P0 | Faible |
| 3 | Absence de rate limiting | Haute | Haute | P0 | Moyen |
| 4 | Validation uploads | Moyenne | Moyenne | P1 | Moyen |
| 5 | Fuites d'informations erreurs | Moyenne | Moyenne | P1 | Faible |
| 6 | Absence de CSP | Faible | Moyenne | P1 | Moyen |
| 7 | Idempotence webhooks | Faible | Moyenne | P2 | Moyen |
| 8 | Vérification propriété | Faible | Moyenne | P2 | Faible |
| 9 | Gestion sessions | Faible | Faible | P3 | Faible |

---

## 🎯 PLAN D'ACTION DÉTAILLÉ

### 🔴 Priorité 0 - À corriger IMMÉDIATEMENT (Avant production)

**Délai : Cette semaine**

#### 1. Corriger la clé de chiffrement
- [ ] Supprimer le fallback dans `src/lib/encryption.ts`
- [ ] Générer une clé forte : `openssl rand -hex 32`
- [ ] Configurer `ENCRYPTION_KEY` dans tous les environnements
- [ ] Ajouter une validation au démarrage de l'app
- [ ] Tester le chiffrement/déchiffrement
- [ ] Documenter la procédure de rotation de clés

**Estimation :** 2 heures

#### 2. Corriger le contrôle d'accès fichiers
- [ ] Remplacer `includes()` par `startsWith()` dans `upload/hero-image/route.ts`
- [ ] Ajouter des logs pour les tentatives non autorisées
- [ ] Tester avec différents cas limites
- [ ] Appliquer le même correctif pour les uploads de documentation

**Estimation :** 1 heure

#### 3. Implémenter le rate limiting
- [ ] Installer `@upstash/ratelimit` et `@upstash/redis`
- [ ] Configurer Upstash Redis (ou alternative)
- [ ] Créer `lib/rate-limit.ts` avec les limiteurs
- [ ] Appliquer sur les routes d'authentification
- [ ] Appliquer sur les routes de paiement
- [ ] Appliquer sur les routes d'upload
- [ ] Tester les limites et ajuster si nécessaire

**Estimation :** 4 heures

**Total P0 : 7 heures**

---

### 🟠 Priorité 1 - À corriger CETTE SEMAINE

**Délai : 7 jours**

#### 4. Améliorer la validation des uploads
- [ ] Installer `file-type` package
- [ ] Valider les extensions de fichiers
- [ ] Valider les magic bytes
- [ ] Tester avec des fichiers malformés
- [ ] Documenter les types autorisés

**Estimation :** 3 heures

#### 5. Implémenter la gestion d'erreurs sécurisée
- [ ] Créer `lib/error-handler.ts`
- [ ] Refactorer toutes les routes API pour utiliser le handler
- [ ] Configurer des logs structurés (ex: Winston, Pino)
- [ ] Tester en dev et production

**Estimation :** 4 heures

#### 6. Ajouter les headers de sécurité
- [ ] Configurer CSP dans `next.config.ts`
- [ ] Tester avec Google OAuth et Stripe
- [ ] Ajuster les directives si nécessaire
- [ ] Vérifier avec https://securityheaders.com

**Estimation :** 3 heures

**Total P1 : 10 heures**

---

### 🟡 Priorité 2 - À faire CE MOIS

**Délai : 30 jours**

#### 7. Implémenter l'idempotence des webhooks
- [ ] Ajouter le modèle `ProcessedStripeEvent` à Prisma
- [ ] Migrer la base de données
- [ ] Modifier le webhook handler
- [ ] Tester avec des événements dupliqués
- [ ] Ajouter un nettoyage automatique des anciens événements

**Estimation :** 4 heures

#### 8. Audit complet des permissions
- [ ] Créer `lib/authorization.ts`
- [ ] Auditer toutes les routes `PUT` et `DELETE`
- [ ] Ajouter les vérifications de propriété manquantes
- [ ] Ajouter des logs d'audit pour les accès sensibles
- [ ] Créer des tests automatisés

**Estimation :** 6 heures

#### 9. Enrichir les audit logs
- [ ] Identifier toutes les actions sensibles
- [ ] Ajouter des logs pour les changements de prix
- [ ] Ajouter des logs pour les téléchargements
- [ ] Ajouter IP et User-Agent dans les métadonnées
- [ ] Créer un dashboard d'audit pour les admins

**Estimation :** 5 heures

**Total P2 : 15 heures**

---

### 🟢 Priorité 3 - Améliorations FUTURES

**Délai : Prochains mois**

#### 10. Rotation des clés de chiffrement
- [ ] Concevoir le système de versioning des clés
- [ ] Implémenter la rotation automatique
- [ ] Créer un script de migration des données chiffrées
- [ ] Documenter la procédure

**Estimation :** 8 heures

#### 11. Chiffrement des données personnelles
- [ ] Identifier toutes les données sensibles
- [ ] Implémenter le chiffrement des numéros de téléphone
- [ ] Mettre à jour le schema Prisma
- [ ] Migrer les données existantes
- [ ] Conformité RGPD

**Estimation :** 10 heures

#### 12. Tests de sécurité automatisés
- [ ] Configurer SAST (Static Application Security Testing)
- [ ] Configurer DAST (Dynamic Application Security Testing)
- [ ] Implémenter des tests de pénétration automatisés
- [ ] Intégrer dans la CI/CD

**Estimation :** 12 heures

**Total P3 : 30 heures**

---

## 🔧 OUTILS RECOMMANDÉS

### Sécurité des Dépendances
- **npm audit** - Audit des vulnérabilités des packages
- **Snyk** - Monitoring continu des vulnérabilités
- **Dependabot** - Mises à jour automatiques des dépendances

### Analyse Statique
- **ESLint security plugin** - Détection de patterns non sécurisés
- **SonarQube** - Analyse de qualité et sécurité du code
- **Semgrep** - Détection de vulnérabilités spécifiques

### Monitoring en Production
- **Sentry** - Tracking d'erreurs avec contexte de sécurité
- **LogRocket** - Session replay pour détecter les comportements suspects
- **Upstash Redis** - Rate limiting et analytics

### Tests de Sécurité
- **OWASP ZAP** - Tests de pénétration automatisés
- **Burp Suite** - Tests manuels approfondis
- **SecurityHeaders.com** - Vérification des headers HTTP

---

## 📚 RÉFÉRENCES ET STANDARDS

### Standards de Sécurité
- **OWASP Top 10 2021** - https://owasp.org/Top10/
- **OWASP API Security Top 10** - https://owasp.org/API-Security/
- **CWE Top 25** - https://cwe.mitre.org/top25/

### Best Practices Next.js
- **Next.js Security** - https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **Vercel Security** - https://vercel.com/docs/security

### Conformité
- **RGPD** - Protection des données personnelles
- **PCI DSS** - Standards pour les paiements par carte
- **SOC 2** - Sécurité des systèmes d'information

---

## 📝 CHECKLIST DE DÉPLOIEMENT EN PRODUCTION

### Avant le Déploiement
- [ ] Toutes les failles P0 sont corrigées
- [ ] Les variables d'environnement sont configurées et validées
- [ ] Les clés de chiffrement sont générées et sécurisées
- [ ] Le rate limiting est activé et testé
- [ ] Les headers de sécurité sont configurés
- [ ] Les logs d'audit sont fonctionnels
- [ ] Les backups automatiques sont configurés
- [ ] Un plan de réponse aux incidents est en place

### Après le Déploiement
- [ ] Monitoring actif des logs de sécurité
- [ ] Alertes configurées pour les comportements suspects
- [ ] Tests de pénétration programmés
- [ ] Revue de sécurité mensuelle planifiée
- [ ] Formation de l'équipe sur les pratiques sécuritaires
- [ ] Documentation de sécurité à jour

---

## 👥 RESPONSABILITÉS

### Développeurs
- Corriger les failles identifiées
- Implémenter les recommandations de sécurité
- Maintenir les dépendances à jour
- Suivre les best practices de code sécurisé

### DevOps / Infrastructure
- Configurer les variables d'environnement sécurisées
- Mettre en place le monitoring et les alertes
- Gérer les sauvegardes et la récupération
- Maintenir les certificats SSL/TLS

### Product / Management
- Prioriser les correctifs de sécurité
- Allouer les ressources nécessaires
- Approuver les audits de sécurité réguliers
- Définir les politiques de sécurité

---

## 📞 CONTACT ET SUPPORT

Pour toute question concernant ce rapport ou pour signaler une nouvelle vulnérabilité :

- **Email sécurité :** security@neaply.com (à créer)
- **Bug Bounty :** Considérer la mise en place d'un programme
- **Divulgation responsable :** Créer une politique de divulgation

---

## 📅 HISTORIQUE DES RÉVISIONS

| Date | Version | Auteur | Modifications |
|------|---------|--------|---------------|
| 2025-11-01 | 1.0 | Audit Automatisé | Rapport initial complet |

---

## ⚖️ DISCLAIMER

Ce rapport a été généré à partir d'une analyse automatisée du code source. Il ne remplace pas un audit de sécurité professionnel réalisé par des experts en cybersécurité. Pour une application manipulant des paiements et des données sensibles, il est fortement recommandé de faire réaliser un audit de sécurité complet par une entreprise spécialisée avant le déploiement en production.

---

**Fin du rapport d'audit de sécurité**

---

*Généré le 1er novembre 2025*

