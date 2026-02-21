import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      )
    }

    const rows = await sql`
      SELECT * FROM orders WHERE order_number = ${orderNumber} AND customer_email = ${email} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order not found. Please check your order number and email address.'
      }, { status: 404 })
    }

    const orderData = rows[0];

    // Get order items
    const items = await sql`
      SELECT oi.*, p.name, p.image_url FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderData.id}
    `;

    const order = {
      id: orderData.id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      total_amount: orderData.total_amount || 0,
      status: orderData.status || 'pending',
      tracking_number: orderData.tracking_number || null,
      created_at: orderData.created_at,
      shipped_at: orderData.shipped_at,
      delivered_at: orderData.delivered_at,
      shipping_address: orderData.shipping_address || {},
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      }))
    };

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track order. Please try again.'
    }, { status: 500 })
  }
}
