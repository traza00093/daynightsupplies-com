import { NextResponse } from 'next/server';

export async function GET() {
  const template = `product_name,description,price,category_id,stock_quantity,sku
Sample Product,Sample description,29.99,1,100,SKU001`;

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="bulk_upload_template.csv"'
    }
  });
}
