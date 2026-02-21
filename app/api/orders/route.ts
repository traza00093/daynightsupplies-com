import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, customer_email, items, subtotal = 0, total_amount, shipping_amount = 0, discount_amount = 0, coupon_code, shipping_address, billing_address, payment_method, shipping_carrier_id, estimated_delivery, payment_intent_id, payment_status = 'pending', user_id } = body

    if (!customer_name || !customer_email || !items || !total_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const rows = await sql`
      INSERT INTO orders (order_number, user_id, customer_name, customer_email, subtotal, tax_amount, shipping_amount, total_amount, status, shipping_address, billing_address, payment_method, payment_status, stripe_payment_id, created_at, updated_at)
      VALUES (${orderNumber}, ${user_id || null}, ${customer_name}, ${customer_email}, ${subtotal}, ${0}, ${shipping_amount}, ${total_amount}, 'pending', ${JSON.stringify(shipping_address || null)}, ${JSON.stringify(billing_address || null)}, ${payment_method || null}, ${payment_status}, ${payment_intent_id || null}, NOW(), NOW())
      RETURNING id
    `;

    const orderId = rows[0].id;

    // Insert order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price})
      `;
    }

    // Send order confirmation email (non-blocking)
    emailService.sendOrderConfirmation({
      orderNumber,
      customerName: customer_name,
      customerEmail: customer_email,
      totalAmount: total_amount,
      subtotal: subtotal,
      discountAmount: discount_amount,
      couponCode: coupon_code,
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shipping_address,
      status: 'pending'
    }).catch(err => console.error('Failed to send order confirmation email:', err))

    // Send admin alert email (non-blocking)
    emailService.sendNewOrderAlert({
      order_number: orderNumber,
      customer_name,
      customer_email,
      items,
      subtotal,
      total_amount,
      discount_amount,
      coupon_code,
      payment_method,
      payment_status,
      shipping_address,
      billing_address
    }, orderNumber).catch(err => console.error('Failed to send admin alert email:', err))

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order', details: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders', details: String(error) }, { status: 500 })
  }
}
