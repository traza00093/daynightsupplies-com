#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load env
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Error loading .env.local', e);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function reset() {
  const email = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';
  const password = 'admin123';

  try {
    const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const hash = await bcrypt.hash(password, 10);

    if (users.length === 0) {
      console.log('User not found, creating...');
      await sql`
        INSERT INTO users (email, password_hash, account_type, first_name, last_name, is_active, email_verified, created_at, updated_at)
        VALUES (${email}, ${hash}, 'admin', 'Admin', 'User', true, true, NOW(), NOW())
      `;
      console.log('Created admin user');
    } else {
      console.log('User found, updating password...');
      await sql`
        UPDATE users SET password_hash = ${hash}, account_type = 'admin', updated_at = NOW()
        WHERE id = ${users[0].id}
      `;
      console.log('Updated admin password to: admin123');
    }
  } catch (e) {
    console.error('Error', e);
  }
}

reset();
