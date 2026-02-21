import { NextRequest } from 'next/server';
import { createContactMessage } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { first_name, last_name, email, subject, message } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message is too long (max 5000 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to create contact message...');

    // Create the contact message in the database
    const result = await createContactMessage({
      first_name,
      last_name,
      email,
      subject,
      message
    });

    console.log('Contact message creation result:', result);

    if (!result.success) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to save message' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to admin
    try {
      const { emailService } = await import('@/lib/email');

      await emailService.sendContactMessageNotification({
        first_name,
        last_name,
        email,
        subject,
        message
      });
    } catch (emailError) {
      console.error('Contact notification email send failed:', emailError);
      // Don't fail the contact submission if email fails
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}