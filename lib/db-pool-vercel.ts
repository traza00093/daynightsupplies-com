import { neon } from '@neondatabase/serverless';

// Build DATABASE_URL from Vercel's PostgreSQL environment variables
function buildDatabaseUrl(): string {
  // Check if DATABASE_URL is already set
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Build from Vercel's PostgreSQL variables
  const host = process.env.PGHOST_UNPOOLED || process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const port = process.env.PGPORT || '5432';

  if (!host || !database || !user || !password) {
    throw new Error('Missing required PostgreSQL environment variables. Please ensure PGHOST, PGDATABASE, PGUSER, and PGPASSWORD are set.');
  }

  return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
}

let _sql: ReturnType<typeof neon> | null = null;

function getSQL(): ReturnType<typeof neon> {
  if (!_sql) {
    const databaseUrl = buildDatabaseUrl();
    console.log('Connecting to database with URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs
    _sql = neon(databaseUrl);
  }
  return _sql;
}

// Tagged template function that lazily initializes the Neon connection.
// Uses a Proxy so the connection is not established at module import time
// (which would fail during Next.js build when DATABASE_URL is not available).
export const sql = new Proxy(
  function () {} as unknown as ReturnType<typeof neon>,
  {
    apply(_target: any, _thisArg: any, args: any[]) {
      const realSql = getSQL();
      return (realSql as any).apply(null, args);
    },
  }
) as unknown as (strings: TemplateStringsArray, ...values: any[]) => Promise<Record<string, any>[]>;