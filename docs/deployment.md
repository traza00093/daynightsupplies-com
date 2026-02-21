# Deployment Guide

Open Store is optimized for deployment on [Vercel](https://vercel.com), which provides free hosting for Next.js applications.

## Deploy to Vercel

### Prerequisites
- A GitHub/GitLab/Bitbucket account
- A [Vercel](https://vercel.com) account (free)
- A [Neon](https://neon.tech) database (free)
- A [Stripe](https://stripe.com) account

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/open-store.git
git push -u origin main
```

### Step 2: Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js settings

### Step 3: Configure Environment Variables

In the Vercel project settings, add all required environment variables:

**Required:**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | `https://your-store.vercel.app` |
| `NEXTAUTH_SECRET` | (generate with `openssl rand -base64 32`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |

**Recommended:**

| Variable | Example |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | (from Vercel Blob settings) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `your-email@gmail.com` |
| `SMTP_PASS` | `app-password` |
| `STORE_NAME` | `My Store` |
| `STORE_EMAIL` | `hello@mystore.com` |
| `ADMIN_EMAIL` | `admin@mystore.com` |

See [Environment Variables](environment-variables.md) for the complete list.

### Step 4: Enable Vercel Blob (for image uploads)

1. In your Vercel project, go to **Storage**
2. Create a new **Blob** store
3. The `BLOB_READ_WRITE_TOKEN` will be automatically added to your project

### Step 5: Deploy

Click **Deploy**. Vercel will build and deploy your application.

### Step 6: Create Admin Account (Web Setup)

After your first deployment, visit:

```
https://your-store.vercel.app/setup
```

The setup page will:
1. Automatically create all database tables if they don't exist
2. Let you create your admin account with a secure password

This page disables itself permanently once an admin account exists.

> **Optional:** For extra security, set a `SETUP_SECRET` environment variable in Vercel before visiting `/setup`. The page will require this secret before allowing setup. See [Environment Variables](environment-variables.md).

**Alternative: CLI Setup**

If you prefer using the command line:

```bash
export DATABASE_URL="postgresql://..."
npx ts-node scripts/setup-db.ts
export ADMIN_EMAIL="admin@mystore.com"
node scripts/init-admin.js
```

### Step 8: Configure Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-store.vercel.app/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret
5. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

## Custom Domain

1. In Vercel project settings, go to **Domains**
2. Add your domain (e.g., `mystore.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

## Production Checklist

- [ ] All environment variables are set
- [ ] Admin account created via `/setup` (database tables are created automatically)
- [ ] `SETUP_SECRET` set if you want to protect the setup page (optional)
- [ ] Stripe is in **live mode** (not test mode)
- [ ] Stripe webhook is configured with production URL
- [ ] SMTP email is configured and tested
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Vercel Blob storage is connected
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active (automatic with Vercel)

## Monitoring

### Vercel Dashboard
- **Deployments** - Build logs and deployment history
- **Analytics** - Traffic and performance metrics
- **Logs** - Runtime logs and errors

### Built-in Health Checks
- `/api/health` - Basic health check (database connectivity)
- `/admin/system-health` - Detailed system metrics (admin only)

## Updating

To deploy updates:

```bash
git add .
git commit -m "Update description"
git push
```

Vercel automatically deploys on every push to the main branch.

## Rollback

If a deployment causes issues:
1. Go to Vercel dashboard > **Deployments**
2. Find the last working deployment
3. Click the **...** menu > **Promote to Production**
