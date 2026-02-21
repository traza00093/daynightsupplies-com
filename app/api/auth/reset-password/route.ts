import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db-pool'
import bcrypt from 'bcryptjs'
import { validatePasswordStrength } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body
    if (!token || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const strength = validatePasswordStrength(newPassword)
    if (!strength.valid) {
      return NextResponse.json({ error: `Password requirements not met: ${strength.errors.join(', ')}` }, { status: 400 })
    }

    const users = await sql`
      SELECT id, password_reset_expires FROM users WHERE password_reset_token = ${token} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user = users[0];
    const expires = user.password_reset_expires ? new Date(user.password_reset_expires) : null;

    if (!expires || expires < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await sql`
      UPDATE users SET password_hash = ${hashed}, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
