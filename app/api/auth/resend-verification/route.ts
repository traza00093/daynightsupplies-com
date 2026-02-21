import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db-pool'
import crypto from 'crypto'
import { emailService } from '@/lib/email'
import { authRateLimiter } from '@/lib/validation'
import { getClientIP } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    if (!authRateLimiter.isAllowed(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { email } = body
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const users = await sql`SELECT id, email_verified FROM users WHERE email = ${email} LIMIT 1`;

    if (users.length === 0) {
      return NextResponse.json({ success: true })
    }

    if (users[0].email_verified) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await sql`
      UPDATE users SET verification_token = ${token}, verification_token_expires = ${expires.toISOString()}, updated_at = NOW()
      WHERE id = ${users[0].id}
    `;

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
    const link = `${origin}/auth/verify-email?token=${token}`
    await emailService.sendEmailVerificationEmail(email, link)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to resend verification' }, { status: 500 })
  }
}
