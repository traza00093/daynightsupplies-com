# Payments (Stripe Integration)

Open Store uses [Stripe](https://stripe.com) for secure payment processing.

## Setup

### 1. Create a Stripe Account

Sign up at [stripe.com](https://stripe.com) and complete the onboarding process.

### 2. Get API Keys

From the [Stripe Dashboard](https://dashboard.stripe.com/apikeys):
- **Publishable key** (`pk_test_...`) - Used client-side
- **Secret key** (`sk_test_...`) - Used server-side

### 3. Configure Environment Variables

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### 4. Configure via Admin Panel (Alternative)

Stripe keys can also be set from **Admin > Settings**:
- Enter the publishable and secret keys
- These override environment variables

## How Payments Work

### Checkout Flow

1. Customer adds items to cart
2. Customer proceeds to checkout
3. Customer enters shipping details
4. A **Payment Intent** is created via `/api/create-payment-intent`
5. Customer enters card details in Stripe Elements form
6. Payment is confirmed client-side
7. Order is created in the database
8. Customer sees order confirmation

### Payment Processing

```
Customer → Checkout Page → Create Payment Intent (API)
         → Enter Card Details (Stripe Elements)
         → Confirm Payment (Stripe.js)
         → Create Order (API)
         → Order Confirmation Page
```

### Webhook Processing

After payment, Stripe sends webhook events to `/api/stripe/webhook`:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Mark order as paid, decrement inventory, send confirmation email |
| `payment_intent.payment_failed` | Mark order as failed, send failure notification |
| `checkout.session.completed` | Log checkout completion |

## Webhook Setup

### Local Development

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret and add it:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your production URL: `https://your-store.com/api/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the signing secret
6. Add as `STRIPE_WEBHOOK_SECRET` in your environment

## Going Live

When ready to accept real payments:

1. Complete Stripe account verification
2. Switch from test keys (`pk_test_`, `sk_test_`) to live keys (`pk_live_`, `sk_live_`)
3. Update the webhook endpoint to use live mode
4. Update environment variables with live keys

## Testing Payments

### Test Card Numbers

| Card | Number | Behavior |
|------|--------|----------|
| Visa (success) | `4242 4242 4242 4242` | Payment succeeds |
| Visa (decline) | `4000 0000 0000 0002` | Payment declines |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |
| Insufficient funds | `4000 0000 0000 9995` | Fails with insufficient funds |

Use any future expiry date and any 3-digit CVC.

## Coupons & Discounts

Coupons are applied at checkout before payment:

1. Customer enters a coupon code
2. Code is validated via `/api/coupons/validate`
3. Discount is applied to the order total
4. Payment Intent is created with the discounted amount

Coupon types:
- **Percentage** - e.g., 10% off
- **Fixed Amount** - e.g., $5 off

Coupon rules:
- Minimum order amount
- Maximum discount cap
- Usage limit
- Expiry date

## Refunds

Refunds are handled directly through the [Stripe Dashboard](https://dashboard.stripe.com/payments). Open Store does not currently have a built-in refund UI - use Stripe's dashboard to process refunds.
