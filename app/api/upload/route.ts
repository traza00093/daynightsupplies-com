import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const rawFolder = (formData.get('folder') as string) || 'products';
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${folder || 'products'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
