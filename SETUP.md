# Configuration de l'authentification neaply

## Étapes de configuration

### 1. Configuration Supabase

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL="postgresql://username:password@db.your-project.supabase.co:5432/postgres"
```

### 2. Configuration Google OAuth

Dans votre projet Supabase :

1. Allez dans `Authentication` > `Providers`
2. Activez Google OAuth
3. Configurez les URLs de redirection :
   - Site URL : `http://localhost:3000`
   - Redirect URLs : `http://localhost:3000/auth/callback`

### 3. Obtenir les clés Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans `Settings` > `API`
4. Copiez :
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Lancer l'application

```bash
npm run dev
```

## Pages disponibles

- `/auth/login` - Page de connexion
- `/auth/register` - Page d'inscription
- `/auth/reset-password` - Réinitialisation du mot de passe
- `/auth/callback` - Callback OAuth (automatique)

## Fonctionnalités

✅ Authentification par email/mot de passe
✅ Authentification Google OAuth
✅ Inscription avec confirmation email
✅ Réinitialisation du mot de passe
✅ Protection des routes avec middleware
✅ Gestion d'état avec Context API
✅ Interface utilisateur avec shadcn/ui
