import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Running schema migration...');

  // Split by semicolons and run each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      // Use the sql function directly with a raw query
      // @ts-ignore - neon() returns a function that accepts raw SQL strings
      await sql(statement);
    } catch (error: any) {
      console.error(`Error running statement: ${statement.substring(0, 80)}...`);
      console.error(error.message);
    }
  }

  console.log('Schema migration complete.');
}

setupDatabase().catch(console.error);
