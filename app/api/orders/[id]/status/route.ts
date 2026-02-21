import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db-pool'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = parseInt(params.id);
    const { status, notes, trackingNumber } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const existing = await sql`SELECT id, shipped_at, delivered_at FROM orders WHERE id = ${orderId}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = existing[0];

    // Build update
    if (status === 'shipped' && !order.shipped_at) {
      await sql`
        UPDATE orders SET status = ${status}, notes = COALESCE(${notes ?? null}, notes), tracking_number = COALESCE(${trackingNumber ?? null}, tracking_number), shipped_at = NOW(), updated_at = NOW()
        WHERE id = ${orderId}
      `;
    } else if (status === 'delivered' && !order.delivered_at) {
      await sql`
        UPDATE orders SET status = ${status}, notes = COALESCE(${notes ?? null}, notes), tracking_number = COALESCE(${trackingNumber ?? null}, tracking_number), delivered_at = NOW(), updated_at = NOW()
        WHERE id = ${orderId}
      `;
    } else {
      await sql`
        UPDATE orders SET status = ${status}, notes = COALESCE(${notes ?? null}, notes), tracking_number = COALESCE(${trackingNumber ?? null}, tracking_number), updated_at = NOW()
        WHERE id = ${orderId}
      `;
    }

    const updated = await sql`SELECT * FROM orders WHERE id = ${orderId}`;

    return NextResponse.json({ order: updated[0] })
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
