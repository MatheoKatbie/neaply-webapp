# Stripe Integration Setup for neaply

This document provides instructions for setting up Stripe payments in neaply.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App URL (used for redirect URLs)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Stripe Dashboard Setup

### 1. Create a Stripe Account

- Go to [stripe.com](https://stripe.com) and create an account
- Complete the account verification process

### 2. Get API Keys

- In the Stripe Dashboard, go to **Developers > API keys**
- Copy the **Publishable key** (starts with `pk_test_`)
- Copy the **Secret key** (starts with `sk_test_`)

### 3. Set up Webhooks

- Go to **Developers > Webhooks** in the Stripe Dashboard
- Click **Add endpoint**
- Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
- For local development: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
- Select these events to listen for:
  - `checkout.session.completed`
  - `charge.refunded`
  - `payment_intent.succeeded`
- Copy the **Signing secret** (starts with `whsec_`)

### 4. Test Mode vs Live Mode

- Use test keys during development (they start with `sk_test_` and `pk_test_`)
- Switch to live keys only when ready for production

## Local Development with Webhooks

Since Stripe webhooks need a public URL, use ngrok for local testing:

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the HTTPS URL from ngrok in your webhook endpoint

## API Endpoints

### Checkout Session

- **POST** `/api/checkout/session`
- Creates a Stripe checkout session for workflow purchase
- Requires authentication
- Body: `{ workflowId: string, pricingPlanId?: string }`

### Webhook Handler

- **POST** `/api/webhooks/stripe`
- Handles Stripe webhook events
- Verifies webhook signature
- Updates order status and creates payment records

### Order Details

- **GET** `/api/orders/[id]`
- Retrieves order details for authenticated user
- Used in success page to display purchase information

## Testing the Integration

### Test Cards

Use Stripe's test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Testing Flow

1. Navigate to a workflow page
2. Click "Purchase Workflow"
3. Complete checkout with test card
4. Verify order is created in database
5. Check webhook logs in Stripe Dashboard
6. Verify redirect to success page

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up proper error monitoring
- [ ] Configure webhook retry logic
- [ ] Implement proper logging
- [ ] Set up alerts for failed payments

## Security Considerations

- Never expose secret keys in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Implement rate limiting on payment endpoints
- Store sensitive data securely
- Follow PCI compliance guidelines

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**

   - Check that STRIPE_WEBHOOK_SECRET is correct
   - Ensure webhook endpoint URL is accessible
   - Verify that the endpoint receives raw body data

2. **Checkout session creation fails**

   - Verify STRIPE_SECRET_KEY is correct
   - Check that workflow exists and is published
   - Ensure user is authenticated

3. **Orders not updating after payment**
   - Check webhook endpoint is receiving events
   - Verify database transactions are completing
   - Check for errors in webhook handler logs

### Debug Mode

Enable Stripe debug logging by setting:

```bash
DEBUG=stripe:*
```

## Support

For Stripe-specific issues:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For neaply integration issues:

- Check the application logs
- Review the webhook event logs in Stripe Dashboard
- Verify database state matches expected order flow
