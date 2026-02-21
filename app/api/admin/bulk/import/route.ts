import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/lib/admin-auth';

// Bulk import endpoint - currently not implemented for Firestore
// This is a placeholder that returns a helpful message
export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    return NextResponse.json({
      error: 'Bulk import is not yet implemented for Firestore. Please add products individually through the admin panel.'
    }, { status: 501 });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
