import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { removeDuplicateCarriers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a development environment
    const isDev = process.env.NODE_ENV !== 'production';

    // For extra security, you could add an API key check here
    const apiKey = request.headers.get('x-api-key');
    if (process.env.MAINTENANCE_API_KEY && apiKey !== process.env.MAINTENANCE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await removeDuplicateCarriers();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Duplicate carriers cleaned up successfully. Removed ${result.count} records.`
      });
    } else {
      return NextResponse.json({
        error: result.error || 'Failed to remove duplicate carriers'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error cleaning duplicate carriers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}