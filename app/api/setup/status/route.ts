import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseStatus, validateSetupSecret } from '@/lib/setup';

export async function GET(request: NextRequest) {
  try {
    // Check setup secret if configured
    const secret = request.nextUrl.searchParams.get('secret') || undefined;
    if (!validateSetupSecret(secret)) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 403 }
      );
    }

    const status = await checkDatabaseStatus();

    return NextResponse.json({
      tablesExist: status.tablesExist,
      adminExists: status.adminExists,
      needsSetup: !status.adminExists,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}
