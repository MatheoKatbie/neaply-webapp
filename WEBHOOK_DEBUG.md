# Stripe Webhook Debug Guide

## Problèmes identifiés et corrigés

### 1. Redirection des webhooks vers la page de connexion

**Problème :** Les webhooks Stripe étaient redirigés vers `/auth/login` à cause du middleware d'authentification.

**Solution :** Ajout d'exclusions pour les routes webhook dans le middleware :

- Exclusion dans la logique du middleware : `pathname.startsWith('/api/webhooks/')`
- Exclusion dans le pattern de matching : `api/webhooks` dans la regex

### 2. 500 Internal Server Error sur `checkout.session.completed`

**Problème :** Erreur lors du traitement des sessions de checkout complétées.

**Solutions appliquées :**

- Vérification de l'existence de la commande avant mise à jour
- Protection contre le traitement en double des commandes déjà payées
- Meilleure gestion d'erreur avec logs détaillés
- Gestion des erreurs par type d'événement

### 3. `payment_intent.succeeded` ne met pas à jour le statut

**Problème :** L'événement `payment_intent.succeeded` ne mettait pas à jour le statut du paiement.

**Solution :**

- Mise à jour du statut du paiement vers `succeeded`
- Vérification et mise à jour du statut de la commande si nécessaire
- Ajout de logs pour le suivi

## Améliorations apportées

### 1. Gestion d'erreur améliorée

```typescript
try {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break
    // ...
  }
} catch (handlerError) {
  console.error(`Error handling ${event.type} event:`, handlerError)
  // Retour 500 pour les événements critiques (retry automatique)
  if (event.type === 'checkout.session.completed') {
    return NextResponse.json({ error: 'Event processing failed' }, { status: 500 })
  }
  // Retour 200 pour les événements non-critiques (pas de retry)
  return NextResponse.json({ error: 'Event processing failed' }, { status: 200 })
}
```

### 2. Protection contre le traitement en double

```typescript
// Vérifier si la commande existe et son statut actuel
const existingOrder = await tx.order.findUnique({
  where: { id: orderId },
  include: { items: { include: { workflow: true } } },
})

if (!existingOrder) {
  throw new Error(`Order not found: ${orderId}`)
}

// Ne traiter que si la commande n'est pas déjà payée
if (existingOrder.status !== 'paid') {
  // Traitement du paiement...
} else {
  console.log('Order already paid, skipping duplicate processing:', orderId)
}
```

### 3. Logs détaillés

- Ajout de l'ID d'événement dans les logs
- Logs spécifiques pour chaque étape du traitement
- Messages d'erreur plus informatifs

## Outils de debug

### 1. Endpoint de test

`GET /api/webhooks/stripe/test` - Vérifie la connectivité de base

### 2. Script de debug

```bash
npm run debug:webhooks
```

Ce script affiche :

- Les commandes récentes avec leurs statuts
- Les paiements récents
- Les problèmes potentiels (commandes sans paiements, paiements orphelins)

### 3. Logs Stripe

Dans le dashboard Stripe, vérifiez :

- Les tentatives d'envoi de webhooks
- Les codes de statut HTTP retournés
- Les logs d'erreur détaillés

## Vérification du bon fonctionnement

### 1. Test de l'endpoint

```bash
curl https://your-domain.com/api/webhooks/stripe/test
```

### 2. Vérification des logs

Dans Vercel ou votre plateforme de déploiement, vérifiez les logs pour :

- `Processing Stripe webhook event:`
- `Successfully processed checkout session completed`
- `Successfully updated payment status`

### 3. Vérification en base

```bash
npm run debug:webhooks
```

## Configuration Stripe

Assurez-vous que votre webhook Stripe est configuré avec :

**URL :** `https://your-domain.com/api/webhooks/stripe`

**Événements :**

- `checkout.session.completed`
- `payment_intent.succeeded`
- `charge.refunded`

**Secret :** Utilisez le secret webhook généré par Stripe dans `STRIPE_WEBHOOK_SECRET`

## Dépannage

### Erreur 500 persistante

1. Vérifiez les logs de l'application
2. Utilisez le script de debug : `npm run debug:webhooks`
3. Testez l'endpoint : `GET /api/webhooks/stripe/test`

### Webhooks non reçus

1. Vérifiez la configuration Stripe
2. Vérifiez que l'URL est accessible
3. Vérifiez le secret webhook

### Commandes non mises à jour

1. Vérifiez les métadonnées de la session Stripe
2. Vérifiez que l'orderId est correct
3. Utilisez le script de debug pour identifier les problèmes

## Monitoring

Pour un monitoring en production, considérez :

1. **Alertes** sur les erreurs 500
2. **Métriques** sur les webhooks reçus/traités
3. **Logs structurés** pour faciliter l'analyse
4. **Health checks** réguliers de l'endpoint
