import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance, formatAmountForStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', orderId } = await request.json();

    const stripe = await getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        // Include the order ID in the metadata so the webhook can update the order status
        orderId: orderId || 'unknown',
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}