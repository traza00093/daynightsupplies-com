const { neon } = require('@neondatabase/serverless');

function getSQL() {
  return neon(process.env.DATABASE_URL);
}

class MigrationManager {
  async init() {
    const sql = getSQL();
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  async runMigration(name, migrationSql) {
    const sql = getSQL();
    try {
      const existing = await sql`SELECT id FROM migrations WHERE name = ${name}`;
      if (existing.length > 0) {
        console.log(`Migration ${name} already applied`);
        return;
      }

      // @ts-ignore - raw SQL execution
      await sql(migrationSql);

      await sql`INSERT INTO migrations (name) VALUES (${name})`;
      console.log(`Migration ${name} applied successfully`);
    } catch (error) {
      console.error(`Migration ${name} failed:`, error);
      throw error;
    }
  }

  async runAllMigrations() {
    await this.init();
    console.log('All migrations completed (schema managed via schema.sql)');
  }
}

module.exports = { MigrationManager };
