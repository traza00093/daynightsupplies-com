import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

// Security headers for all responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com https://checkout.stripe.com; " +
    "frame-src https://js.stripe.com https://hooks.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// CSRF token generation and validation
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expires: number }> = new Map();
  
  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokens.get(sessionId);
    
    if (!storedToken || storedToken.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return storedToken.token === token;
  }
  
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];
    
    this.tokens.forEach((tokenData, sessionId) => {
      if (tokenData.expires < now) {
        expiredSessions.push(sessionId);
      }
    });
    
    expiredSessions.forEach(sessionId => {
      this.tokens.delete(sessionId);
    });
  }
}

// Admin authorization check
export async function requireAdmin(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { authorized: false, error: 'No session found' };
    }
    
    // Check if user is admin
    if (session.user.isAdmin) {
      return { authorized: true, userId: session.user.id };
    }
    
    // Fallback: Check database for admin status
    const rows = await sql`SELECT account_type FROM users WHERE id = ${parseInt(session.user.id)}`;

    if (rows.length === 0) {
      return { authorized: false, error: 'User not found' };
    }

    const isAdmin = rows[0].account_type === 'admin';
    
    return { 
      authorized: isAdmin, 
      userId: session.user.id,
      error: isAdmin ? undefined : 'Insufficient permissions'
    };
  } catch (error) {
    console.error('Admin authorization error:', error);
    return { authorized: false, error: 'Authorization check failed' };
  }
}

// User authentication check
export async function requireAuth(request: NextRequest): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { authenticated: false, error: 'No session found' };
    }
    
    return { 
      authenticated: true, 
      userId: session.user.id 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication check failed' };
  }
}

// Input sanitization for database queries
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove null bytes and control characters
    return input.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// SQL injection prevention helper
export function validateTableName(tableName: string): boolean {
  // Only allow alphanumeric characters and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
}

export function validateColumnName(columnName: string): boolean {
  // Only allow alphanumeric characters and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName);
}

// IP address extraction
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

// User agent extraction
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Audit logging
export async function logSecurityEvent(event: {
  type: 'auth_failure' | 'admin_access' | 'suspicious_activity' | 'data_access' | 'permission_denied';
  userId?: string;
  ip: string;
  userAgent: string;
  details: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO user_activity_logs (user_id, activity_type, activity_description, ip_address, user_agent, metadata)
      VALUES (${event.userId ? parseInt(event.userId) : null}, ${'security_' + event.type}, ${event.details}, ${event.ip}, ${event.userAgent}, ${JSON.stringify(event.metadata || {})})
    `;
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  // Check for common weak patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Phone number validation
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// File upload security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' };
  }
  
  return { valid: true };
}