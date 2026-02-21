import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { sql } from '@/lib/db-pool'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const users = await sql`
      SELECT id, verification_token_expires FROM users WHERE verification_token = ${token} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user = users[0];
    const expires = user.verification_token_expires ? new Date(user.verification_token_expires) : null;

    if (!expires || expires < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    await sql`
      UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify email error', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
