import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' })
    }

    const rows = await sql`SELECT * FROM coupons WHERE code = ${code.toUpperCase()} AND is_active = true`;

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Coupon code not found' })
    }

    const coupon = rows[0]

    // Check if coupon is valid
    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, error: 'Coupon is not yet valid' })
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' })
    }

    if (orderTotal && coupon.minimum_order_amount && orderTotal < coupon.minimum_order_amount) {
      return NextResponse.json({ valid: false, error: `Minimum order amount is $${coupon.minimum_order_amount}` })
    }

    return NextResponse.json({ valid: true, coupon })
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
