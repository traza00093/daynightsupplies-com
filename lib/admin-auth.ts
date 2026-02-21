import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function validateAdminAccess(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated', status: 401 };
    }

    // CRITICAL: Check admin status from session first
    if (session.user.isAdmin === true) {
      return { authorized: true, user: session.user };
    }

    // Fallback: Check database for admin status
    try {
      const users = await sql`
        SELECT account_type, is_active FROM users WHERE email = ${session.user.email} LIMIT 1
      `;

      if (users.length === 0) {
        return { authorized: false, error: 'User not found', status: 404 };
      }

      const userData = users[0];
      const isAdmin = userData.account_type === 'admin' && userData.is_active === true;

      if (!isAdmin) {
        console.warn(`Unauthorized admin access attempt by: ${session.user.email}`);
        return { authorized: false, error: 'Insufficient permissions', status: 403 };
      }

      return { authorized: true, user: session.user };
    } catch (dbError) {
      console.error('Database validation error:', dbError);
      return { authorized: false, error: 'Unable to verify permissions', status: 500 };
    }
  } catch (error) {
    console.error('Admin validation error:', error);
    return { authorized: false, error: 'Internal server error', status: 500 };
  }
}

export function createAdminResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

export function createErrorResponse(error: string, status = 500) {
  return createAdminResponse({ error }, status);
}
