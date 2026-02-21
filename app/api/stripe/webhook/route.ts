import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeInstance } from '@/lib/stripe';
import { getSettings, updateOrderStatus } from '@/lib/db';
import { sql } from '@/lib/db-pool';

// Stripe requires the raw body for signature verification
export async function POST(request: NextRequest) {
  // Get the raw body
  const buffer = await request.arrayBuffer();
  const bodyArray = new Uint8Array(buffer);
  let body = '';
  for (let i = 0; i < bodyArray.length; i++) {
    body += String.fromCharCode(bodyArray[i]);
  }
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let stripeInstance: Stripe;
  try {
    stripeInstance = await getStripeInstance();
  } catch (error) {
    console.error('Stripe instance error:', error);
    return NextResponse.json({ error: 'Failed to initialize Stripe' }, { status: 500 });
  }

  // Get the webhook secret from the database
  const settingsResult = await getSettings();

  if (!settingsResult.success || !settingsResult.settings?.stripe_webhook_secret) {
    console.error('Stripe webhook secret not configured in settings');
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
  }

  const webhookSecret = settingsResult.settings?.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripeInstance.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: `Webhook signature verification failed: ${error.message}` }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

      if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
        const orderId = parseInt(paymentIntent.metadata.orderId);

        // Update order with paid status and Stripe ID
        try {
          await sql`UPDATE orders SET status = 'paid', payment_status = 'paid', stripe_payment_id = ${paymentIntent.id}, updated_at = NOW() WHERE id = ${orderId}`;
          console.log(`Successfully updated order ${orderId} status to 'paid'`);
        } catch (error) {
          console.error(`Failed to update order status for order ${orderId}:`, error);
        }

        // Decrement Inventory and Send Email
        try {
          const orderRows = await sql`SELECT * FROM orders WHERE id = ${orderId}`;

          if (orderRows.length > 0) {
            const order = orderRows[0];
            const { decrementStock } = await import('@/lib/db');

            // Get order items
            const orderItems = await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;

            // Update Inventory
            for (const item of orderItems) {
              if (item.product_id) {
                await decrementStock(item.product_id, item.quantity);
              }
            }

            // Send email notification
            const { emailService } = await import('@/lib/email');

            await emailService.sendOrderStatusUpdate({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              totalAmount: parseFloat(order.total_amount),
              subtotal: parseFloat(order.subtotal || order.total_amount),
              discountAmount: 0,
              couponCode: undefined,
              items: (orderItems || []) as any,
              shippingAddress: order.shipping_address,
              status: 'paid'
            });
          }
        } catch (error) {
          console.error('Post-payment processing failed (inventory/email):', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent failed: ${paymentFailedIntent.id}`);

      if (paymentFailedIntent.metadata && paymentFailedIntent.metadata.orderId) {
        const orderId = paymentFailedIntent.metadata.orderId;
        const result = await updateOrderStatus(orderId, 'payment_failed', 'failed');
        if (!result.success) {
          console.error(`Failed to update order status for order ${orderId}:`, result.error);
        } else {
          console.log(`Successfully updated order ${orderId} status to 'failed'`);

          // Send email notification
          try {
            const orderRows = await sql`SELECT * FROM orders WHERE id = ${parseInt(orderId)}`;

            if (orderRows.length > 0) {
              const order = orderRows[0];
              const { emailService } = await import('@/lib/email');
              const orderItems = await sql`SELECT * FROM order_items WHERE order_id = ${parseInt(orderId)}`;

              await emailService.sendOrderStatusUpdate({
                orderNumber: order.order_number,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                totalAmount: parseFloat(order.total_amount),
                subtotal: parseFloat(order.subtotal || order.total_amount),
                discountAmount: 0,
                couponCode: undefined,
                items: (orderItems || []) as any,
                shippingAddress: order.shipping_address,
                status: 'failed'
              });
            }
          } catch (emailError) {
            console.error('Email notification failed after failed payment:', emailError);
          }
        }
      }
      break;

    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout session completed: ${checkoutSession.id}`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
