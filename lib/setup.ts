import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { schemaStatements } from './schema-statements';
import { sql } from './db-pool-vercel'; // Use the single, correct Vercel pool

// ... (rest of the file is unchanged)

export interface DatabaseStatus {
  tablesExist: boolean;
  adminExists: boolean;
  tableCount: number;
}

/**
 * Check if database tables exist and if an admin user is present.
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    const tableCount = tables.length;
    const tablesExist = tables.some(
      (t: Record<string, unknown>) => t.table_name === 'users'
    );

    if (!tablesExist) {
      return { tablesExist: false, adminExists: false, tableCount };
    }

    const admins = await sql`
      SELECT id FROM users WHERE account_type = 'admin' LIMIT 1
    `;

    return {
      tablesExist: true,
      adminExists: admins.length > 0,
      tableCount,
    };
  } catch {
    return { tablesExist: false, adminExists: false, tableCount: 0 };
  }
}

/**
 * Run all CREATE TABLE statements. All use IF NOT EXISTS so this is idempotent.
 * Uses neon() directly with raw strings (same pattern as scripts/setup-db.ts).
 */
export async function runSchemaMigration(): Promise<{ success: boolean; error?: string }> {
  try {
    // Execute each schema statement sequentially using the single, correct database pool.
    for (const statement of schemaStatements) {
      if (statement.trim().length > 0) {
        await sql.unsafe(statement);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[setup] Migration failed:', error);
    return {
      success: false,
      error: 'Database migration failed. Check server logs for details.',
    };
  }
}

/**
 * Create the first admin user. Uses an atomic INSERT ... WHERE NOT EXISTS
 * to prevent race conditions where two concurrent requests could both create admins.
 */
export async function createFirstAdmin(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Atomic: only inserts if no admin exists. Returns the inserted row (or nothing).
    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type, is_active, email_verified, created_at, updated_at)
      SELECT ${data.email}, ${passwordHash}, ${data.firstName}, ${data.lastName}, 'admin', true, true, NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE account_type = 'admin'
      )
      RETURNING id
    `;

    if (result.length === 0) {
      return { success: false, error: 'An admin user already exists' };
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { success: false, error: 'A user with this email already exists' };
    }
    console.error('[setup] Admin creation failed:', error);
    return { success: false, error: 'Failed to create admin account. Check server logs for details.' };
  }
}

/**
 * Validate setup secret if SETUP_SECRET env var is configured.
 * Uses timing-safe comparison to prevent timing attacks.
 * Returns true if access is allowed.
 */
export function validateSetupSecret(providedSecret?: string): boolean {
  const envSecret = process.env.SETUP_SECRET;
  // Not configured or empty = no protection required
  if (!envSecret || envSecret.trim().length === 0) return true;
  if (!providedSecret) return false;

  try {
    const a = Buffer.from(envSecret, 'utf-8');
    const b = Buffer.from(providedSecret, 'utf-8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
