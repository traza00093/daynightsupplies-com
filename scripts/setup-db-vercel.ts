import { neon } from '@neondatabase/serverless';
import { schemaStatements } from '@/lib/schema-statements';

async function setupDatabase() {
  // Build DATABASE_URL from Vercel's PostgreSQL variables
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

  try {
    const databaseUrl = buildDatabaseUrl();
    console.log('Setting up database with URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs
    
    const sql = neon(databaseUrl);

    console.log('Running schema migration...');
    console.log(`Executing ${schemaStatements.length} SQL statements...`);

    // Execute each schema statement
    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i].trim();
      if (statement.length === 0) continue;
      
      try {
        console.log(`Running statement ${i + 1}/${schemaStatements.length}...`);
        await sql.unsafe(statement);
        console.log(`✓ Statement ${i + 1} completed`);
      } catch (error: any) {
        console.error(`✗ Error in statement ${i + 1}: ${statement.substring(0, 100)}...`);
        console.error('Error details:', error.message);
        // Continue with other statements even if one fails
      }
    }

    console.log('✅ Schema migration complete!');
    
    // Test the connection by running a simple query
    try {
      const result = await sql`SELECT current_database(), current_user, version()`;
      console.log('Database connection test:');
      console.log('- Database:', result[0].current_database);
      console.log('- User:', result[0].current_user);
      console.log('- PostgreSQL Version:', result[0].version.split(' ')[1]);
    } catch (testError) {
      console.warn('⚠️  Database connection test failed:', testError);
    }

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };