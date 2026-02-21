'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onBeforePayment?: () => Promise<{ orderId: string } | null>;
}

function CheckoutForm({ amount, onSuccess, onBeforePayment }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe) {
      setError('Stripe is not properly configured. Please check your payment settings.');
      return;
    }

    if (!elements) {
      setError('Payment form is not properly initialized.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let orderId = null;

      if (onBeforePayment) {
        const result = await onBeforePayment();
        if (result && result.orderId) {
          orderId = result.orderId;
        } else {
          // If onBeforePayment returns null/false, we assume validation failed or user cancelled in that step.
          // We should stop here.
          setLoading(false);
          return;
        }
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          orderId: orderId // Pass the orderId if we have one
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      if (loading) setLoading(false);
    }
  };

  if (!stripe) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-yellow-500 rounded bg-yellow-50 text-yellow-700">
          <p>Payment processing is not currently configured. Please set up your Stripe API keys in the admin settings.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-secondary-800 rounded bg-secondary-950">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#ffffff',
              '::placeholder': { color: '#9ca3af' },
              iconColor: '#ffffff'
            }
          }
        }} />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary-500/20"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

// Create the stripe promise only once
function getStripePromise() {
  if (!stripePromise) {
    stripePromise = new Promise(async (resolve) => {
      try {
        // Fetch the publishable key from settings API
        const response = await fetch('/api/settings');
        if (!response.ok) {
          console.error('Failed to fetch settings');
          resolve(null);
          return;
        }

        const { settings } = await response.json();
        const publishableKey = settings.stripePublishableKey;

        if (publishableKey && publishableKey !== '') {
          // Load Stripe with the publishable key from settings
          const stripeInstance = await loadStripe(publishableKey);
          resolve(stripeInstance);
        } else {
          console.error('Stripe publishable key is not configured');
          resolve(null);
        }
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        resolve(null);
      }
    });
  }
  return stripePromise;
}

export default function PaymentForm({ amount, onSuccess, onBeforePayment }: PaymentFormProps) {
  const stripePromise = getStripePromise();

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onBeforePayment={onBeforePayment} />
    </Elements>
  );
}