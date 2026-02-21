# Open Store

A modern, full-featured e-commerce platform built with Next.js 14, Neon Postgres, and Stripe. Designed to be self-hosted on Vercel with minimal configuration.

## Features

### Storefront
- **Product Catalog** - Categories, search, filtering, sorting, and pagination
- **Product Pages** - Image gallery, reviews, ratings, recommendations, stock tracking
- **Shopping Cart** - Persistent cart with quantity management
- **Checkout** - Stripe payment integration with order confirmation emails
- **Order Tracking** - Track orders by order number + email
- **Wishlist** - Save products for later (authenticated users)
- **Product Comparison** - Compare up to 4 products side-by-side
- **Newsletter** - Email subscription for marketing
- **Contact Form** - Customer inquiries with admin management

### Customer Accounts
- **Registration & Login** - Email/password authentication via NextAuth.js
- **Email Verification** - Token-based email verification flow
- **Password Reset** - Secure forgot/reset password flow
- **Profile Management** - Update name, phone, address
- **Order History** - View all past orders with details
- **Wishlist Management** - Add/remove wishlist items

### Admin Dashboard
- **Dashboard Analytics** - Revenue, orders, customers, trends with charts
- **Product Management** - Full CRUD with image upload (Vercel Blob)
- **Category Management** - Create/edit categories with icons and images
- **Order Management** - View, update status, tracking numbers, shipping labels
- **User Management** - View, search, edit, activate/deactivate users
- **Coupon System** - Create percentage/fixed discount coupons with rules
- **Review Moderation** - Approve/reject customer reviews
- **Contact Messages** - Read and manage customer inquiries
- **Inventory Alerts** - Low stock and out-of-stock notifications
- **Shipping Carriers** - Manage carriers with rate calculation
- **Email Settings** - Configure SMTP, test emails, customize templates
- **Store Settings** - Store name, currency, Stripe keys, feature toggles
- **SEO Settings** - Meta tags, social sharing configuration
- **Security Logs** - Track admin actions, login attempts, security events
- **Backup & Restore** - Export/import database as JSON
- **System Health** - Database, API, memory, and uptime monitoring

### Technical
- **Responsive Design** - Mobile-first, works on all screen sizes
- **SEO Optimized** - Dynamic meta tags, Open Graph, structured data
- **Email System** - 7 transactional email types (order confirmation, shipping, password reset, etc.)
- **Rate Limiting** - Brute-force protection on auth endpoints
- **Security Headers** - XSS, clickjacking, MIME sniffing protection
- **Subscription System** - Plans, billing cycles, subscription management
- **Support Chat** - Basic customer support chat system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Database | [Neon Postgres](https://neon.tech) (Serverless) |
| Auth | [NextAuth.js](https://next-auth.js.org) v4 |
| Payments | [Stripe](https://stripe.com) |
| File Storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Email | [Nodemailer](https://nodemailer.com) (any SMTP) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| UI Components | [Radix UI](https://radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

## Quick Start

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) database (free tier works)
- A [Stripe](https://stripe.com) account
- An SMTP email provider (Gmail, SendGrid, etc.)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/open-store.git
cd open-store
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials. See [Environment Variables](docs/environment-variables.md) for details.

**Required variables:**
- `DATABASE_URL` - Neon Postgres connection string
- `NEXTAUTH_SECRET` - Random secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000`)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### 3. Set Up Database & Admin Account

**Option A: Web Setup (Recommended for Vercel)**

Start the app and visit [http://localhost:3000/setup](http://localhost:3000/setup). The setup page will automatically create database tables and let you create your admin account — no terminal access required.

**Option B: CLI Setup**

```bash
npm run db:setup        # Create database tables
npm run admin:init      # Create initial admin user (credentials printed to console)
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add all environment variables from `.env.production.example`
4. Deploy
5. Visit `https://your-store.vercel.app/setup` to create your admin account

See [Deployment Guide](docs/deployment.md) for detailed instructions.

### Environment Variables for Production

Copy `.env.production.example` and configure all values. See [Environment Variables](docs/environment-variables.md).

## Project Structure

```
open-store/
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes (REST endpoints)
│   ├── auth/               # Authentication pages
│   ├── account/            # Customer account pages
│   └── ...                 # Public storefront pages
├── components/             # React components
│   ├── admin/              # Admin-specific components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── contexts/               # React context providers
├── lib/                    # Server-side utilities
│   ├── db.ts               # Database query functions
│   ├── db-pool.ts          # Neon Postgres connection
│   ├── schema.sql          # Database schema
│   ├── schema-statements.ts # Schema as TS array (serverless-safe)
│   ├── setup.ts            # First-run setup utilities
│   ├── auth.ts             # NextAuth configuration
│   ├── email.ts            # Email service (7 template types)
│   ├── stripe.ts           # Stripe configuration
│   ├── shipping.ts         # Shipping rate calculation
│   ├── subscription.ts     # Subscription management
│   └── ...                 # Security, validation, utilities
├── scripts/                # Setup & maintenance scripts
├── public/                 # Static assets
├── docs/                   # Documentation
└── .env.local.example      # Environment variable template
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Detailed setup walkthrough |
| [Database Setup](docs/database-setup.md) | Neon Postgres configuration and schema |
| [Admin Guide](docs/admin-guide.md) | Using the admin dashboard |
| [Deployment](docs/deployment.md) | Deploying to Vercel |
| [Email Configuration](docs/email-setup.md) | SMTP setup and email templates |
| [Payments](docs/payments.md) | Stripe integration and webhooks |
| [Environment Variables](docs/environment-variables.md) | All configuration options |
| [Customization](docs/customization.md) | Theming, branding, and extending |
| [API Reference](docs/api-reference.md) | REST API endpoints |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:setup` | Run database migrations |
| `npm run admin:init` | Create initial admin user |
| `npm run admin:ensure` | Ensure admin user exists |
| `npm run backup` | Backup database |
| `npm run restore` | Restore database from backup |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
