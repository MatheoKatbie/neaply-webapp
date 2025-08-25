# Google One Tap Setup Guide

Ce guide vous explique comment configurer Google One Tap pour votre application FlowMarket.

## 1. Configuration Google Cloud Console

### Étape 1: Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Identity Services

### Étape 2: Configurer les identifiants OAuth 2.0
1. Dans la console Google Cloud, allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application" comme type d'application
4. Configurez les paramètres suivants :

#### Origines JavaScript autorisées
```
http://localhost:3000
http://localhost
http://127.0.0.1:3000
https://yourdomain.com
https://www.yourdomain.com
```

#### URI de redirection autorisés
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
https://yourdomain.com/auth/callback
```

### Étape 3: Configurer l'écran de consentement OAuth
1. Allez dans "APIs & Services" > "OAuth consent screen"
2. Remplissez les informations suivantes :
   - **Nom de l'application**: FlowMarket
   - **Logo de l'application**: Logo de votre application
   - **Adresse e-mail d'assistance**: votre-email@domain.com
   - **Domaines autorisés**: votredomain.com
   - **Lien vers la page d'accueil**: https://yourdomain.com
   - **Lien vers la politique de confidentialité**: https://yourdomain.com/privacy
   - **Lien vers les conditions d'utilisation**: https://yourdomain.com/terms

## 2. Configuration des variables d'environnement

Ajoutez la variable suivante à votre fichier `.env.local` :

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 3. Configuration Content Security Policy (CSP)

Si vous utilisez une Content Security Policy, ajoutez les directives suivantes :

```http
Content-Security-Policy: 
  script-src 'self' https://accounts.google.com/gsi/client;
  frame-src https://accounts.google.com/gsi/;
  connect-src https://accounts.google.com/gsi/;
  default-src 'self' https://accounts.google.com/gsi/;
```

## 4. Configuration Next.js pour CORS

Ajoutez la configuration suivante dans votre `next.config.ts` :

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin; same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## 5. Configuration Cross-Origin Opener Policy (COOP)

Si FedCM n'est pas activé, configurez l'en-tête COOP :

```http
Cross-Origin-Opener-Policy: same-origin; same-origin-allow-popups
```

## 6. Fonctionnalités implémentées

### Google One Tap
- ✅ Affichage automatique sur la page d'accueil
- ✅ Intégration avec Supabase Auth
- ✅ Gestion des états de chargement
- ✅ Affichage conditionnel (uniquement si non connecté)
- ✅ Configuration flexible via props

### Configuration par défaut
- **autoSelect**: true (connexion automatique si un seul compte)
- **cancelOnTapOutside**: true (ferme le popup si clic à l'extérieur)
- **context**: "signin" (contexte de connexion)
- **uxMode**: "popup" (mode popup)
- **itpSupport**: true (support ITP)

## 7. Test de l'intégration

1. Démarrez votre application en mode développement
2. Allez sur la page d'accueil (http://localhost:3000)
3. Le popup Google One Tap devrait apparaître automatiquement
4. Testez la connexion avec un compte Google

## 8. Dépannage

### Le popup ne s'affiche pas
- Vérifiez que `NEXT_PUBLIC_GOOGLE_CLIENT_ID` est correctement configuré
- Vérifiez les origines JavaScript autorisées dans Google Cloud Console
- Vérifiez la console du navigateur pour les erreurs

### Erreurs d'authentification
- Vérifiez que Supabase est configuré pour Google OAuth
- Vérifiez les URI de redirection dans Google Cloud Console
- Vérifiez que l'écran de consentement OAuth est configuré

### Problèmes de CSP
- Vérifiez que votre Content Security Policy autorise les domaines Google
- Testez temporairement sans CSP pour isoler le problème

## 8. Personnalisation

Vous pouvez personnaliser le comportement en modifiant les props dans `GoogleOneTapWrapper.tsx` :

```typescript
<GoogleOneTap
  clientId={googleClientId}
  autoSelect={false} // Désactiver la sélection automatique
  cancelOnTapOutside={false} // Empêcher la fermeture par clic extérieur
  context="signup" // Changer le contexte
  uxMode="redirect" // Utiliser le mode redirection
/>
```

## 9. Sécurité

- Ne partagez jamais votre `client_id` ou `client_secret` publiquement
- Utilisez des domaines autorisés restrictifs
- Configurez correctement l'écran de consentement OAuth
- Surveillez les logs d'authentification pour détecter les activités suspectes
