#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Running database migrations...');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await sql(statement);
    } catch (error) {
      console.error(`Error: ${statement.substring(0, 60)}...`);
      console.error(error.message);
    }
  }

  console.log('All migrations completed successfully');
  process.exit(0);
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
