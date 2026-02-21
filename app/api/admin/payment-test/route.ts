import { NextRequest } from 'next/server';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';
import { getStripeInstance } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const stripe = await getStripeInstance();
    const account = await stripe.accounts.retrieve();
    
    return createAdminResponse({
      status: 'connected',
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        type: account.type
      },
      message: 'Stripe is properly configured'
    });
  } catch (error: any) {
    console.error('Payment test error:', error);
    return createErrorResponse(error.message || 'Stripe is not configured');
  }
}