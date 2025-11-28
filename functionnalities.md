🚀 Fonctionnalités à Ajouter
1. Notifications & Communication
Fonctionnalité	Description
Système de notifications	Notifications in-app pour : nouvelles ventes, reviews, mises à jour de workflows achetés
Newsletter	Backend pour la page Coming Soon (la form existe mais pas de logique de sauvegarde)
Notifications email	Emails transactionnels (achat, nouveau follower, workflow mis à jour)
Préférences de notifications	Section dans Settings pour gérer les emails/push notifications
2. Social & Engagement
Fonctionnalité	Description
Follow Store	Permettre aux utilisateurs de suivre des stores et être notifiés des nouveaux workflows
Commentaires sur workflows	Système de Q&A sous chaque workflow (différent des reviews)
Share functionality	Boutons de partage social (Twitter, LinkedIn, Copy link)
Profil utilisateur public	Page profil acheteur avec achats publics, reviews écrites
3. Marketplace Avancé
Fonctionnalité	Description
Coupons/Réductions	Système de codes promo pour les sellers
Bundles dynamiques	Permettre aux acheteurs de créer leurs propres bundles avec discount
Workflow comparaison	Comparer 2-3 workflows côte à côte
Version d'essai/Preview	Version limitée gratuite avant achat
Licence multi-siège	Options de pricing pour équipes (1 user, 5 users, unlimited)
4. Dashboard Seller
Fonctionnalité	Description
Analytics avancés	Graphiques de ventes, sources de trafic, conversions
Export données	Export CSV/Excel des ventes, clients
Gestion des reviews	Répondre aux reviews depuis le dashboard
Promotions	Créer des promotions temporaires (ex: -20% pendant 7 jours)
5. Admin Panel
Fonctionnalité	Description
Dashboard analytics global	Vue d'ensemble de la plateforme (GMV, users actifs, etc.)
Gestion des catégories/tags	CRUD pour categories et tags depuis l'admin
Logs d'audit visuels	Interface pour voir les AuditLogs existants
Modération automatique	Flags automatiques sur contenu suspect
Gestion des payouts	Vue et gestion des versements aux sellers
6. UX/Fonctionnalités Utilisateur
Fonctionnalité	Description
Historique de recherche	Sauvegarder les recherches récentes
Recherche sauvegardée	Alertes email quand un nouveau workflow match une recherche
Mode sombre/clair	Toggle theme (actuellement dark only)
Multi-langue	i18n existe partiellement, compléter avec FR/ES/DE
Onboarding tour	Guide interactif pour nouveaux utilisateurs
7. Technique / Performance
Fonctionnalité	Description
PWA complète	Service worker, offline mode, install prompt
Caching Redis	Cache pour workflows populaires, recherches
Rate limiting	Protection API contre abus
Webhook pour sellers	Notifier les sellers via webhook lors d'un achat
API publique	API REST/GraphQL pour intégrations tierces
8. Sécurité & Conformité
Fonctionnalité	Description
GDPR export	Export de toutes les données utilisateur
Account deletion flow	Process complet de suppression de compte
Session management	Vue de toutes les sessions actives + déconnexion à distance
IP-based security alerts	Alertes pour connexions depuis nouvelles localisations