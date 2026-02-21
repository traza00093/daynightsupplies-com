import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await sql`
      INSERT INTO newsletter_subscribers (email, status, subscribed_at)
      VALUES (${email}, 'active', NOW())
      ON CONFLICT (email) DO UPDATE SET status = 'active', subscribed_at = NOW()`;

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
