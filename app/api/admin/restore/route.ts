import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('backup') as File;

    if (!file) {
      return NextResponse.json({ error: 'No backup file provided' }, { status: 400 });
    }

    const content = await file.text();
    let backup: any;

    try {
      backup = JSON.parse(content);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
    }

    if (!backup.collections || typeof backup.collections !== 'object') {
      return NextResponse.json({ error: 'Invalid backup structure' }, { status: 400 });
    }

    const results: any = {
      success: true,
      restored: {},
      errors: []
    };

    // Restore settings (simple key-value)
    if (backup.collections.settings && Array.isArray(backup.collections.settings)) {
      try {
        let count = 0;
        for (const row of backup.collections.settings) {
          if (row.key) {
            await sql`INSERT INTO settings (key, value, updated_at) VALUES (${row.key}, ${JSON.stringify(row.value)}, NOW()) ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(row.value)}, updated_at = NOW()`;
            count++;
          }
        }
        results.restored.settings = count;
      } catch (error: any) {
        results.errors.push(`settings: ${error.message}`);
      }
    }

    // Restore categories
    if (backup.collections.categories && Array.isArray(backup.collections.categories)) {
      try {
        let count = 0;
        for (const row of backup.collections.categories) {
          await sql`INSERT INTO categories (name, slug, icon, image_url) VALUES (${row.name}, ${row.slug}, ${row.icon || null}, ${row.image_url || null}) ON CONFLICT (slug) DO NOTHING`;
          count++;
        }
        results.restored.categories = count;
      } catch (error: any) {
        results.errors.push(`categories: ${error.message}`);
      }
    }

    // Note: Full restore of all tables would need more complex logic
    // This is a simplified version that handles the most common tables

    if (results.errors.length > 0) {
      results.success = false;
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({
      error: 'Failed to restore backup',
      details: error.message
    }, { status: 500 });
  }
}
