import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id);

    const items = await sql`
      SELECT w.id, w.product_id, w.added_at as created_at, p.name, p.price, p.image_url, p.rating, p.reviews_count
      FROM wishlist w
      LEFT JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
      ORDER BY w.added_at DESC`;

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Wishlist fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const userId = parseInt(session.user.id);

    await sql`INSERT INTO wishlist (user_id, product_id, added_at) VALUES (${userId}, ${parseInt(productId)}, NOW()) ON CONFLICT (user_id, product_id) DO NOTHING`;

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wishlist add error:', error)
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const userId = parseInt(session.user.id);

    await sql`DELETE FROM wishlist WHERE user_id = ${userId} AND product_id = ${parseInt(productId)}`;

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wishlist delete error:', error)
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
