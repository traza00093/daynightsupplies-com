import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getCategory } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db-init';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    await ensureDatabaseInitialized();
    
    if (slug) {
      const result = await getCategory(slug);
      if (result.success) {
        return NextResponse.json({ success: true, category: result.category });
      } else {
        return NextResponse.json({ success: false, error: result.error || 'Failed to fetch category' }, { status: 500 });
      }
    } else {
      const result = await getCategories();
      if (result.success) {
        return NextResponse.json({ success: true, categories: result.categories });
      } else {
        return NextResponse.json({ success: false, error: result.error || 'Failed to fetch categories' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
