#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.production.local' });
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Database connection string not configured');
  console.error('Set DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(connectionString);

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Test connection
    console.log('Testing database connection...');
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful');

    // Check if tables exist
    console.log('Checking tables...');
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    const tables = tablesResult.map(r => r.table_name);
    console.log(`Found ${tables.length} tables`);

    if (tables.length === 0) {
      console.log('No tables found. Run: node scripts/migrate.js');
    } else {
      console.log('Tables:', tables.join(', '));
    }

    // Check counts
    if (tables.includes('users')) {
      const usersResult = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`Users: ${usersResult[0].count}`);
    }

    if (tables.includes('products')) {
      const productsResult = await sql`SELECT COUNT(*) as count FROM products`;
      console.log(`Products: ${productsResult[0].count}`);
    }

    if (tables.includes('orders')) {
      const ordersResult = await sql`SELECT COUNT(*) as count FROM orders`;
      console.log(`Orders: ${ordersResult[0].count}`);
    }

    console.log('\nDatabase initialization check complete');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
