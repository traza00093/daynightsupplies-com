import { NextRequest, NextResponse } from 'next/server';
import { resetAdminPassword, generateAdminResetToken } from '@/lib/admin-init';
import { addSecurityHeaders, getClientIP, getUserAgent } from '@/lib/security';
import { authRateLimiter } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting for password reset attempts
    if (!authRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, newPassword, action } = body;

    // Generate new reset token
    if (action === 'generate-token') {
      const result = await generateAdminResetToken();
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      const response = NextResponse.json({
        message: 'Reset token generated successfully',
        token: result.token,
        expiresIn: '24 hours'
      });

      return addSecurityHeaders(response);
    }

    // Reset password with token
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    const result = await resetAdminPassword(token, newPassword);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      message: 'Password reset successfully',
      success: true
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Password reset error:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );

    return addSecurityHeaders(response);
  }
}