import { sql } from '@/lib/db-pool';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;

  try {
    // Quick check if tables exist by querying the settings table
    await sql`SELECT 1 FROM settings LIMIT 1`;
    isInitialized = true;
  } catch {
    // Tables don't exist yet - this is expected on first run
    // Run setup-db.ts script or deploy schema via Neon dashboard
    console.warn('Database tables not found. Run: npx tsx scripts/setup-db.ts');
    isInitialized = true;
  }
}
