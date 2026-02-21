import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sql`INSERT INTO recently_viewed (user_id, product_id, viewed_at) VALUES (${userId}, ${productId}, CURRENT_TIMESTAMP) ON CONFLICT (user_id, product_id) DO UPDATE SET viewed_at = CURRENT_TIMESTAMP`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const products = await sql`SELECT p.* FROM recently_viewed rv JOIN products p ON rv.product_id = p.id WHERE rv.user_id = ${parseInt(userId)} ORDER BY rv.viewed_at DESC LIMIT 10`;

    return NextResponse.json({ success: true, products })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recently viewed' }, { status: 500 });
  }
}
