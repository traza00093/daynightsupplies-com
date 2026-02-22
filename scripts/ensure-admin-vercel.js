#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

// Build DATABASE_URL from Vercel's PostgreSQL variables
function buildDatabaseUrl() {
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
    console.error('Missing required PostgreSQL environment variables:');
    console.error('- PGHOST:', host ? '✓' : '✗');
    console.error('- PGDATABASE:', database ? '✓' : '✗');
    console.error('- PGUSER:', user ? '✓' : '✗');
    console.error('- PGPASSWORD:', password ? '✓' : '✗');
    throw new Error('Missing required PostgreSQL environment variables. Please ensure PGHOST, PGDATABASE, PGUSER, and PGPASSWORD are set.');
  }

  return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
}

async function ensureAdminUser() {
  try {
    const databaseUrl = buildDatabaseUrl();
    console.log('Connecting to database for admin setup...');
    console.log('Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs

    const sql = neon(databaseUrl);

    console.log('Checking admin user...');

    const email = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';
    const rows = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email} AND account_type = 'admin'
    `;

    if (rows.length === 0) {
      console.log('Admin user not found. Creating...');

      const hashedPassword = await bcrypt.hash('admin123', 12);
      await sql`
        INSERT INTO users (email, password_hash, first_name, last_name, account_type, is_active, email_verified, created_at, updated_at)
        VALUES (${email}, ${hashedPassword}, 'System', 'Administrator', 'admin', true, true, NOW(), NOW())
      `;

      console.log('✅ Admin user created successfully');
      console.log('Email:', email);
      console.log('Password: admin123');
      console.log('⚠️  IMPORTANT: Change password after first login!');
    } else {
      console.log('Admin user already exists');
      console.log('Email:', rows[0].email);
    }
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error.message);
    if (error.message.includes('relation "users" does not exist')) {
      console.error('The database tables may not be created yet. Run database setup first.');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  ensureAdminUser().catch(console.error);
}

module.exports = { ensureAdminUser };