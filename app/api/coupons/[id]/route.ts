import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    const { code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, valid_from, valid_until, is_active } = body;

    if (discount_type && !['percentage', 'fixed_amount'].includes(discount_type)) {
      return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 });
    }

    if (discount_value !== undefined && discount_value <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE coupons SET
        code = COALESCE(${code ? code.toUpperCase() : null}, code),
        description = COALESCE(${description ?? null}, description),
        discount_type = COALESCE(${discount_type ?? null}, discount_type),
        discount_value = COALESCE(${discount_value ?? null}, discount_value),
        minimum_order_amount = COALESCE(${minimum_order_amount ?? null}, minimum_order_amount),
        maximum_discount_amount = COALESCE(${maximum_discount_amount ?? null}, maximum_discount_amount),
        usage_limit = COALESCE(${usage_limit ?? null}, usage_limit),
        valid_from = COALESCE(${valid_from ?? null}, valid_from),
        valid_until = COALESCE(${valid_until ?? null}, valid_until),
        is_active = COALESCE(${is_active ?? null}, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ${id}
       RETURNING *`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon: rows[0] });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });
    }

    const rows = await sql`DELETE FROM coupons WHERE id = ${id} RETURNING id`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
