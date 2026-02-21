import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';

async function createAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const email = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';
  const password = 'admin123';

  console.log('Creating/Updating admin user:', email);

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type, is_active, email_verified, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, 'Studio', 'Admin', 'admin', true, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${hashedPassword},
        account_type = 'admin',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
    `;

    console.log('Admin user created/updated successfully.');
    console.log('Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
