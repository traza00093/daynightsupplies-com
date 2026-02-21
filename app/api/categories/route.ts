import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db-init';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    await ensureDatabaseInitialized();
    const result = await getCategories(slug || undefined);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        categories: result.categories 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Service unavailable' }, 
      { status: 503 }
    );
  }
}
