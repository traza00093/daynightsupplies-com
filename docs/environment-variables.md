# Environment Variables

All configuration is done through environment variables. Copy `.env.local.example` to `.env.local` for development.

## Required Variables

These must be set for the application to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` (dev) or `https://mystore.com` (prod) |
| `NEXTAUTH_SECRET` | Session encryption secret | Generate with `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |

## Database

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | *Required* |

## Authentication

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_URL` | App base URL | *Required* |
| `NEXTAUTH_SECRET` | Session secret | *Required* |
| `JWT_SECRET` | JWT signing secret | Falls back to `NEXTAUTH_SECRET` |
| `ADMIN_EMAIL` | Default admin email | `admin@example.com` |

## Payments (Stripe)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe key | *Required* |
| `STRIPE_SECRET_KEY` | Server-side Stripe key | *Required* |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Optional (can set in admin) |

## File Storage (Vercel Blob)

| Variable | Description | Default |
|----------|-------------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access token | Auto-set on Vercel |

## Email (SMTP)

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | None |
| `SMTP_PASS` | SMTP password or app password | None |
| `SMTP_FROM` | Sender display name and email | `STORE_EMAIL` value |
| `SENDER_EMAIL` | Sender email address | `SMTP_USER` value |

## Store Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `STORE_NAME` | Store display name | `Open Store` |
| `STORE_EMAIL` | Store contact email | `hello@example.com` |
| `STORE_PHONE` | Store phone number | None |
| `STORE_ADDRESS` | Physical address | None |
| `STORE_CURRENCY` | Display currency | `USD` |
| `STORE_TIMEZONE` | Timezone | `America/New_York` |

## Setup

| Variable | Description | Default |
|----------|-------------|---------|
| `SETUP_SECRET` | Optional secret required to access the `/setup` page. If set, the setup page prompts for this value before allowing admin account creation. Recommended for production deployments. | Not set (no secret required) |

## Production Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_NOTIFICATIONS` | Enable email notifications | `true` |
| `ENABLE_NEWSLETTER` | Enable newsletter signup | `true` |
| `ENABLE_REVIEWS` | Enable product reviews | `true` |
| `ENABLE_WISHLIST` | Enable wishlist feature | `true` |
| `ENABLE_CACHING` | Enable response caching | `false` |

## Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- All other variables are server-side only
- Admin panel settings (Store Settings, Email Settings) override environment variables
- Generate secrets with: `openssl rand -base64 32`
