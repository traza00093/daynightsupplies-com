import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, address, city, state, zipCode } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const rows = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, account_type, is_active, email_verified, verification_token, verification_token_expires, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, 'customer', true, false, ${verificationToken}, ${verificationExpires.toISOString()}, NOW(), NOW())
      RETURNING id, email, first_name, last_name
    `;

    const user = rows[0];

    const origin = process.env.NEXTAUTH_URL || new URL(request.url).origin
    const verifyLink = `${origin}/auth/verify-email?token=${verificationToken}`
    await emailService.sendEmailVerificationEmail(email, verifyLink)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user', details: String(error) },
      { status: 500 }
    )
  }
}
