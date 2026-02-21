import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const result = await getProductById(id);

    if (!result.success || !result.product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const product = result.product as any;

    // Normailze/Polyfill missing fields for frontend compatibility
    // In SQL these came from joins. In NoSQL they should be on the document.
    // If we haven't migrated them, we provide defaults.
    if (!product.images || !Array.isArray(product.images)) {
      product.images = [{ id: 0, image_url: product.image_url, alt_text: product.name }];
    } else if (product.images.length > 0 && typeof product.images[0] === 'string') {
      // Handle new string array format from Firestore
      product.images = product.images.map((url: string, index: number) => ({
        id: index,
        image_url: url,
        alt_text: `${product.name} - Image ${index + 1}`
      }));
    }

    if (!product.variants || !Array.isArray(product.variants)) {
      product.variants = [];
    }

    // Cast IDs to numbers if needed by frontend (or keep strings)
    // The frontend interface expects numbers for IDs.
    // We might need to keep them as is and hope frontend handles coercion or update frontend.
    // For now, let's return what we have.

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
