import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sql } from '@/lib/db-pool';

export interface AdminInitResult {
  success: boolean;
  adminExists: boolean;
  defaultPassword?: string;
  resetToken?: string;
  error?: string;
}

/**
 * Initialize admin user on application startup
 * Creates admin user with secure random password if doesn't exist
 */
export async function initializeAdminUser(): Promise<AdminInitResult> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';

    // Check if admin user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: true,
        adminExists: true
      };
    }

    // Generate secure random password
    const defaultPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type, password_reset_token, password_reset_expires, is_active, email_verified, created_at, updated_at)
      VALUES (${adminEmail}, ${hashedPassword}, 'System', 'Administrator', 'admin', ${resetToken}, ${resetExpires.toISOString()}, true, true, NOW(), NOW())
    `;

    console.log('Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Default Password:', defaultPassword);
    console.log('IMPORTANT: Change password immediately after first login!');

    return {
      success: true,
      adminExists: false,
      defaultPassword,
      resetToken
    };

  } catch (error) {
    console.error('Failed to initialize admin user:', error);
    return {
      success: false,
      adminExists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate cryptographically secure password
 */
function generateSecurePassword(): string {
  const length = 16;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  const categories = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '!@#$%^&*'
  ];

  categories.forEach(category => {
    const randomIndex = crypto.randomInt(0, category.length);
    password += category[randomIndex];
  });

  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
}

/**
 * Reset admin password with secure token
 */
export async function resetAdminPassword(token: string, newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`
      };
    }

    const users = await sql`
      SELECT id, password_reset_expires, account_type FROM users
      WHERE password_reset_token = ${token}
      LIMIT 1
    `;

    if (users.length === 0) {
      return { success: false, error: 'Invalid reset token' };
    }

    const user = users[0];

    if (new Date(user.password_reset_expires) < new Date()) {
      return { success: false, error: 'Expired reset token' };
    }

    if (user.account_type !== 'admin') {
      return { success: false, error: 'Not an admin account' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await sql`
      UPDATE users SET
        password_hash = ${hashedPassword},
        password_reset_token = NULL,
        password_reset_expires = NULL,
        failed_login_attempts = 0,
        account_locked = false,
        locked_until = NULL,
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return { success: true };

  } catch (error) {
    console.error('Error resetting admin password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed'
    };
  }
}

/**
 * Generate admin password reset token
 */
export async function generateAdminResetToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL || 'admin@example.com';

    const users = await sql`SELECT id FROM users WHERE email = ${adminEmail} AND account_type = 'admin' LIMIT 1`;

    if (users.length === 0) {
      return { success: false, error: 'Admin user not found' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await sql`UPDATE users SET password_reset_token = ${token}, password_reset_expires = ${expires.toISOString()}, updated_at = NOW() WHERE id = ${users[0].id}`;

    return { success: true, token };
  } catch (error) {
    console.error('Error generating admin reset token:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate token' };
  }
}

function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
