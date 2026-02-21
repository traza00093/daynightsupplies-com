#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

async function seedData() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('Seeding database with sample data...');

    await sql`
      INSERT INTO categories (id, name, slug, icon, image_url) VALUES
      (1, 'Home Essentials', 'home-essentials', 'Home', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
      (2, 'Personal Care', 'personal-care', 'Heart', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'),
      (3, 'Kitchen & Dining', 'kitchen-dining', 'ChefHat', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
      (4, 'Electronics', 'electronics', 'Smartphone', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
      (5, 'Health & Wellness', 'health-wellness', 'Shield', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400')
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO products (id, name, description, price, category_id, image_url, stock_quantity, in_stock) VALUES
      (1, 'Premium Coffee Maker', 'Professional grade coffee maker', 89.99, 3, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 25, true),
      (2, 'Organic Face Moisturizer', 'Natural ingredients for healthy skin', 24.99, 2, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', 50, true),
      (3, 'Wireless Bluetooth Earbuds', 'High-quality sound with noise cancellation', 79.99, 4, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', 30, true),
      (4, 'Stainless Steel Water Bottle', 'Insulated bottle keeps drinks cold for 24 hours', 19.99, 1, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 100, true),
      (5, 'Essential Oil Diffuser', 'Ultrasonic aromatherapy diffuser with LED lights', 34.99, 5, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 40, true)
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
