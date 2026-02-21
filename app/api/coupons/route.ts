import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active
    } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['percentage', 'fixed_amount'].includes(discount_type)) {
      return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 });
    }

    if (discount_value <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    // Check if coupon code already exists
    const existing = await sql`SELECT id FROM coupons WHERE code = ${code.toUpperCase()}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }

    const rows = await sql`
      INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, used_count, valid_from, valid_until, is_active, created_at)
      VALUES (${code.toUpperCase()}, ${description || ''}, ${discount_type}, ${Number(discount_value)}, ${Number(minimum_order_amount) || 0}, ${maximum_discount_amount ? Number(maximum_discount_amount) : null}, ${usage_limit ? Number(usage_limit) : null}, ${0}, ${valid_from || new Date().toISOString()}, ${valid_until || null}, ${is_active !== false}, NOW())
      RETURNING *`;

    return NextResponse.json({ coupon: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
