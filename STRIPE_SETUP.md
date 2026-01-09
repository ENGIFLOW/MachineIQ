# Stripe Payment Setup

This application uses Stripe for payment processing. Follow these steps to set up Stripe:

## 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup process

## 2. Get Your API Keys

1. In your Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the following:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode) - Click "Reveal test key"

## 3. Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://vietmastercamtraining.com/api/webhooks/stripe`
   - For local development, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

## 4. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, use your live keys (starting with `sk_live_` and `pk_live_`).

## 5. Test the Integration

### Using Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date, any CVC, and any ZIP code

### Local Development with Webhooks

Install Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret for local testing.

## 6. Pricing Configuration

The current subscription is set to:
- **Price**: $99/month per seat
- **Currency**: USD
- **Billing**: Monthly recurring

To change the price, update the `unit_amount` in `src/app/api/create-checkout-session/route.ts`:
- $99 = 9900 cents
- $49 = 4900 cents
- etc.

## 7. Production Deployment

Before going live:
1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Update webhook endpoint URL to your production domain
4. Test with a real card (you can refund test payments)

## Security Notes

- Never commit your secret keys to version control
- Use environment variables for all Stripe keys
- The webhook secret is required to verify webhook authenticity
- Always verify webhook signatures in production

