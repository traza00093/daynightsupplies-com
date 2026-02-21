#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function ensureAdminUser() {
  try {
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

      console.log('Admin user created successfully');
      console.log('Email:', email);
      console.log('Password: admin123');
      console.log('IMPORTANT: Change password after first login!');
    } else {
      console.log('Admin user exists');
      console.log('Email:', rows[0].email);
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  ensureAdminUser();
}

module.exports = { ensureAdminUser };
