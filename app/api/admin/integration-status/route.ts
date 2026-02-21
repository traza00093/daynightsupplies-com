import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';
import { getSettings, getEmailSettings } from '@/lib/db';
import { getStripeInstance } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const status = {
      payment: { configured: false, details: '' },
      email: { configured: false, details: '' },
      database: { configured: false, details: '' }
    };

    // Check Stripe configuration
    try {
      const stripe = await getStripeInstance();
      const account = await stripe.accounts.retrieve();
      status.payment = {
        configured: true,
        details: `Connected to Stripe account: ${account.id}`
      };
    } catch (error: any) {
      status.payment = {
        configured: false,
        details: error.message || 'Stripe not configured'
      };
    }

    // Check Email configuration
    try {
      const emailSettings = await getEmailSettings();
      if (emailSettings.success && emailSettings.emailSettings) {
        status.email = {
          configured: true,
          details: `SMTP: ${emailSettings.emailSettings.smtp_host}:${emailSettings.emailSettings.smtp_port}`
        };
      } else {
        status.email = {
          configured: false,
          details: 'Email settings not found'
        };
      }
    } catch (error: any) {
      status.email = {
        configured: false,
        details: error.message || 'Email configuration error'
      };
    }

    // Check Database configuration
    try {
      const settings = await getSettings();
      if (settings.success) {
        status.database = {
          configured: true,
          details: 'Database connected and accessible'
        };
      } else {
        status.database = {
          configured: false,
          details: 'Database connection failed'
        };
      }
    } catch (error: any) {
      status.database = {
        configured: false,
        details: error.message || 'Database error'
      };
    }

    const allConfigured = status.payment.configured && status.email.configured && status.database.configured;

    return createAdminResponse({
      status: allConfigured ? 'ready' : 'incomplete',
      integrations: status,
      message: allConfigured ? 'All systems ready for production' : 'Some systems need configuration'
    });
  } catch (error: any) {
    console.error('Integration status error:', error);
    return createErrorResponse(error.message || 'Failed to check integration status');
  }
}