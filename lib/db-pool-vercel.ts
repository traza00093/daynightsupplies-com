import { neon, NeonQueryFunction } from '@neondatabase/serverless';

function buildDatabaseUrl(): string {
  // This function prioritizes Vercel's POSTGRES_URL_NON_POOLING
  // but falls back to the standard PG* environment variables.
  if (process.env.POSTGRES_URL_NON_POOLING) {
    return process.env.POSTGRES_URL_NON_POOLING;
  }
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const host = process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const port = process.env.PGPORT || '5432';

  if (!host || !database || !user || !password) {
    throw new Error('Missing required PostgreSQL environment variables for Vercel. Please ensure POSTGRES_URL_NON_POOLING or all PG* variables are set.');
  }

  return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
}

// Singleton instance of the database connection
let sql: NeonQueryFunction<false, false>;

/**
 * Returns a singleton instance of the Neon database connection pool.
 * Creates the connection on the first call.
 * This is the ONLY way the application should get a database connection.
 */
export function getDb(): NeonQueryFunction<false, false> {
  if (!sql) {
    const databaseUrl = buildDatabaseUrl();
    console.log('Initializing database connection...');
    sql = neon(databaseUrl);
  }
  return sql;
}
