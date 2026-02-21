import { neon } from '@neondatabase/serverless';

async function seedData() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Seeding data...');

  // Categories
  await sql`
    INSERT INTO categories (id, name, slug, icon, image_url, created_at)
    VALUES
      (1, 'Home Essentials', 'home-essentials', 'Home', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', NOW()),
      (2, 'Personal Care', 'personal-care', 'Heart', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop', NOW()),
      (3, 'Kitchen & Dining', 'kitchen-dining', 'ChefHat', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', NOW()),
      (4, 'Electronics', 'electronics', 'Smartphone', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', NOW()),
      (5, 'Health & Wellness', 'health-wellness', 'Shield', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', NOW())
    ON CONFLICT (id) DO NOTHING
  `;

  // Reset sequence after explicit ID inserts
  await sql`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))`;

  // Products
  await sql`
    INSERT INTO products (id, name, description, price, original_price, category_id, image_url, rating, reviews_count, in_stock, stock_quantity, sku, weight, dimensions, tags, featured, created_at)
    VALUES
      (1, 'Premium Coffee Maker', 'Professional grade coffee maker with programmable features', 89.99, 119.99, 3, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', 4.8, 124, true, 25, 'PROD-1', 1.0, '10x8x6 inches', ARRAY['general','coffee','kitchen'], false, NOW()),
      (2, 'Organic Face Moisturizer', 'Natural ingredients for healthy, glowing skin', 24.99, NULL, 2, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', 4.9, 89, true, 50, 'PROD-2', 0.5, '6x4x4 inches', ARRAY['personal','skincare','health'], false, NOW()),
      (3, 'Wireless Bluetooth Earbuds', 'High-quality sound with noise cancellation', 79.99, 99.99, 4, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop', 4.7, 203, true, 30, 'PROD-3', 0.3, '8x6x2 inches', ARRAY['electronics','audio','wireless'], false, NOW()),
      (4, 'Stainless Steel Water Bottle', 'Insulated bottle keeps drinks cold for 24 hours', 19.99, NULL, 1, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', 4.6, 156, true, 100, 'PROD-4', 0.7, '12x4x4 inches', ARRAY['home','drinkware','eco'], false, NOW()),
      (5, 'Essential Oil Diffuser', 'Ultrasonic aromatherapy diffuser with LED lights', 34.99, 49.99, 5, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', 4.8, 78, true, 40, 'PROD-5', 0.8, '7x7x10 inches', ARRAY['health','wellness','aromatherapy'], false, NOW())
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`;

  // Default settings
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('general', ${JSON.stringify({
      store_name: process.env.STORE_NAME || 'My Store',
      currency: 'USD',
      enable_reviews: 'true'
    })}::jsonb, NOW())
    ON CONFLICT (key) DO NOTHING
  `;

  console.log('Seed data complete.');
}

seedData().catch(console.error);
