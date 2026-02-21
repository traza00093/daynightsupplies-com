# Contributing to Open Store

Created and maintained by **Muhammad Talha Raza**.

Thank you for your interest in contributing to Open Store! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/open-store.git
   cd open-store
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up your environment** — copy `.env.local.example` to `.env.local` and fill in required values (see [Environment Variables](docs/environment-variables.md))
5. **Set up the database** — follow the [Database Setup](docs/database-setup.md) guide
6. **Start the dev server:**
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes locally
4. Commit with a clear message:
   ```bash
   git commit -m "Add: brief description of the change"
   ```
5. Push to your fork and open a Pull Request

## Commit Message Format

Use a prefix to indicate the type of change:

- `Add:` — New feature or functionality
- `Fix:` — Bug fix
- `Update:` — Enhancement to existing feature
- `Refactor:` — Code restructuring without behavior change
- `Docs:` — Documentation only
- `Style:` — Formatting, CSS, no logic change
- `Test:` — Adding or updating tests

## Project Structure

```
open-store/
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # REST API endpoints
│   └── ...               # Public-facing pages
├── components/           # React components
│   └── ui/               # shadcn/ui base components
├── contexts/             # React context providers
├── lib/                  # Server-side utilities
│   ├── db.ts             # Database query functions
│   ├── db-pool.ts        # Neon Postgres connection
│   ├── auth.ts           # NextAuth configuration
│   ├── email.ts          # Email templates and sending
│   └── schema.sql        # Database schema
├── public/               # Static assets
├── scripts/              # Setup and maintenance scripts
└── docs/                 # Documentation
```

## Guidelines

### Code Style

- Use TypeScript for all new files
- Follow existing patterns in the codebase
- Use the Neon `sql` tagged template for all database queries:
  ```ts
  import { sql } from '@/lib/db-pool';
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  ```
- Use Next.js App Router conventions (Route Handlers, Server Components)

### Database Changes

If your change requires a new table or column:

1. Add the SQL to `lib/schema.sql`
2. Add query functions to `lib/db.ts`
3. Document the change in your PR description

### API Routes

- All API routes go in `app/api/`
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent JSON responses with appropriate status codes
- Admin routes should check authentication with `requireAdmin()`
- Validate user input at the API boundary

### UI Components

- Use [shadcn/ui](https://ui.shadcn.com) components from `components/ui/`
- Follow the existing Tailwind CSS patterns
- Ensure responsive design (mobile-friendly)

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce for bug reports
- Include screenshots for UI issues

## Pull Request Checklist

Before submitting a PR, make sure:

- [ ] Code compiles without errors (`npx tsc --noEmit`)
- [ ] The app builds successfully (`npm run build`)
- [ ] You've tested the feature locally
- [ ] Database changes are reflected in `lib/schema.sql`
- [ ] New API endpoints are documented
- [ ] No secrets or credentials are committed

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
