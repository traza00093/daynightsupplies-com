# Getting Started

This guide walks you through setting up Open Store for local development.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com)
- **Neon Account** - Free at [neon.tech](https://neon.tech) (serverless Postgres)
- **Stripe Account** - Free at [stripe.com](https://stripe.com) (test mode)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/open-store.git
cd open-store
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. It will look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

See [Database Setup](database-setup.md) for full details.

## Step 4: Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the required values:

```env
# Database (from Step 3)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe (from dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

See [Environment Variables](environment-variables.md) for all options.

## Step 5: Start the Development Server

```bash
npm run dev
```

## Step 6: Set Up Database & Admin Account

**Option A: Web Setup (Recommended)**

Visit [http://localhost:3000/setup](http://localhost:3000/setup). The setup page will:
1. Automatically create all database tables
2. Let you create your admin account with a name, email, and password

This is the same flow used on Vercel where terminal access isn't available.

**Option B: CLI Setup**

```bash
npm run db:setup        # Create all tables in your Neon database
npm run admin:init      # Create admin user (credentials printed to console)
```

If using CLI setup, save the generated password — you'll need it to sign in.

Open your browser:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Sign In**: [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)

## Step 7: Seed Sample Data (Optional)

To populate your store with sample products and categories:

```bash
npx ts-node scripts/seed-data.ts
```

## Next Steps

- [Add products](admin-guide.md#products) via the admin panel
- [Configure email](email-setup.md) for order notifications
- [Set up Stripe](payments.md) for accepting payments
- [Customize your store](customization.md) appearance
- [Deploy to Vercel](deployment.md) when ready

## Troubleshooting

### "No database connection string was provided"
Make sure `DATABASE_URL` is set in `.env.local` and the Neon database is accessible.

### "NEXTAUTH_SECRET is not set"
Generate one with `openssl rand -base64 32` and add it to `.env.local`.

### Admin panel returns "Unauthorized"
Make sure you've run `npm run admin:init` and are signed in with the admin email.

### Build fails with TypeScript errors
Run `npx tsc --noEmit` to see specific errors. Most likely a missing environment variable.
