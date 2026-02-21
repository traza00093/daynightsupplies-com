import { NextRequest } from 'next/server';
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return createErrorResponse('Test email address is required', 400);
    }

    // Send test email
    const success = await emailService.sendOrderConfirmation({
      orderNumber: 'TEST-ORDER-001',
      customerName: 'Test Customer',
      customerEmail: testEmail,
      totalAmount: 99.99,
      subtotal: 89.99,
      discountAmount: 0,
      couponCode: undefined,
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 89.99
        }
      ],
      shippingAddress: {
        address: '123 Test Street',
        city: 'Test City',
        state: 'NY',
        zipCode: '11580'
      },
      status: 'pending'
    });

    if (success) {
      return createAdminResponse({
        status: 'success',
        message: `Test email sent successfully to ${testEmail}`
      });
    } else {
      return createErrorResponse('Failed to send test email');
    }
  } catch (error: any) {
    console.error('Email test error:', error);
    return createErrorResponse(error.message || 'Email test failed');
  }
}