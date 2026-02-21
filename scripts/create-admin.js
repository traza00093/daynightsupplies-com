#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const rows = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type, is_active, email_verified, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, 'System', 'Administrator', 'admin', true, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${hashedPassword},
        account_type = 'admin',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
      RETURNING id, email
    `;

    console.log('Admin user created/updated successfully');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
