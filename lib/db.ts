import { sql } from '@/lib/db-pool-vercel';

export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  category_id: number
  category_slug?: string
  image_url: string
  rating: number
  reviews_count: number
  in_stock: boolean
  created_at: Date | string
  stock_quantity: number
  sku?: string
  weight?: number
  dimensions?: string
  tags?: string[]
  featured?: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  image_url: string
  created_at: Date | string
}

export interface Order {
  id: number
  user_id?: number | string
  order_number: string
  customer_name: string
  customer_email: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  status: string
  shipping_address?: any
  billing_address?: any
  payment_method?: string
  payment_status: string
  payment_intent_id?: string
  stripe_payment_id?: string
  tracking_number?: string
  notes?: string
  shipped_at?: Date | string
  delivered_at?: Date | string
  created_at: Date | string
  updated_at: Date | string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
}

export interface Review {
  id: string | number;
  product_id: string | number;
  order_id?: string | number;
  user_id?: string | number;
  customer_name: string;
  customer_email?: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  verified_purchase?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

export async function createTables() {
  console.log('Tables are managed via schema.sql. Run: npx tsx scripts/setup-db.ts');
  return { success: true };
}

export async function seedData() {
  try {
    // Categories
    const categories = [
      { id: 1, name: 'Home Essentials', slug: 'home-essentials', icon: 'Home', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
      { id: 2, name: 'Personal Care', slug: 'personal-care', icon: 'Heart', image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop' },
      { id: 3, name: 'Kitchen & Dining', slug: 'kitchen-dining', icon: 'ChefHat', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
      { id: 4, name: 'Electronics', slug: 'electronics', icon: 'Smartphone', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop' },
      { id: 5, name: 'Health & Wellness', slug: 'health-wellness', icon: 'Shield', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop' }
    ];

    for (const cat of categories) {
      await sql`
        INSERT INTO categories (id, name, slug, icon, image_url, created_at)
        VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.icon}, ${cat.image_url}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Products
    const products = [
      { id: 1, name: 'Premium Coffee Maker', description: 'Professional grade coffee maker with programmable features', price: 89.99, original_price: 119.99, category_id: 3, image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', rating: 4.8, reviews_count: 124, in_stock: true, stock_quantity: 25, sku: 'PROD-1', weight: 1.0, dimensions: '10x8x6 inches', tags: ['general', 'coffee', 'kitchen'], featured: false },
      { id: 2, name: 'Organic Face Moisturizer', description: 'Natural ingredients for healthy, glowing skin', price: 24.99, original_price: null, category_id: 2, image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', rating: 4.9, reviews_count: 89, in_stock: true, stock_quantity: 50, sku: 'PROD-2', weight: 0.5, dimensions: '6x4x4 inches', tags: ['personal', 'skincare', 'health'], featured: false },
      { id: 3, name: 'Wireless Bluetooth Earbuds', description: 'High-quality sound with noise cancellation', price: 79.99, original_price: 99.99, category_id: 4, image_url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop', rating: 4.7, reviews_count: 203, in_stock: true, stock_quantity: 30, sku: 'PROD-3', weight: 0.3, dimensions: '8x6x2 inches', tags: ['electronics', 'audio', 'wireless'], featured: false },
      { id: 4, name: 'Stainless Steel Water Bottle', description: 'Insulated bottle keeps drinks cold for 24 hours', price: 19.99, original_price: null, category_id: 1, image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', rating: 4.6, reviews_count: 156, in_stock: true, stock_quantity: 100, sku: 'PROD-4', weight: 0.7, dimensions: '12x4x4 inches', tags: ['home', 'drinkware', 'eco'], featured: false },
      { id: 5, name: 'Essential Oil Diffuser', description: 'Ultrasonic aromatherapy diffuser with LED lights', price: 34.99, original_price: 49.99, category_id: 5, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', rating: 4.8, reviews_count: 78, in_stock: true, stock_quantity: 40, sku: 'PROD-5', weight: 0.8, dimensions: '7x7x10 inches', tags: ['health', 'wellness', 'aromatherapy'], featured: false }
    ];

    for (const prod of products) {
      await sql`
        INSERT INTO products (id, name, description, price, original_price, category_id, image_url, rating, reviews_count, in_stock, stock_quantity, sku, weight, dimensions, tags, featured, created_at)
        VALUES (${prod.id}, ${prod.name}, ${prod.description}, ${prod.price}, ${prod.original_price}, ${prod.category_id}, ${prod.image_url}, ${prod.rating}, ${prod.reviews_count}, ${prod.in_stock}, ${prod.stock_quantity}, ${prod.sku}, ${prod.weight}, ${prod.dimensions}, ${prod.tags}, ${prod.featured}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Settings
    const settings = {
      store_name: process.env.STORE_NAME || 'My Store',
      currency: 'USD',
      enable_reviews: 'true'
    };
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('general', ${JSON.stringify(settings)}::jsonb, NOW())
      ON CONFLICT (key) DO NOTHING
    `;

    console.log('Seed data written to Postgres');
    return { success: true };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error };
  }
}

// Helper query functions
export async function getProducts(categoryId?: string, limit: number = 20, featured?: boolean) {
  try {
    let rows;

    if (categoryId && featured !== undefined) {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${parseInt(categoryId)}
          AND p.featured = ${featured}
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;
    } else if (categoryId) {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ${parseInt(categoryId)}
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;
    } else if (featured !== undefined) {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.featured = ${featured}
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      rows = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;
    }

    const products = rows.map((r: any) => ({
      ...r,
      category_name: r.category_name || 'Uncategorized'
    }));

    return { success: true, products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error };
  }
}

export async function getCategories(slug?: string) {
  try {
    let rows;
    if (slug) {
      rows = await sql`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`;
    } else {
      rows = await sql`SELECT * FROM categories ORDER BY name`;
    }
    return { success: true, categories: rows };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error };
  }
}

export async function getProductById(id: string | number) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    const rows = await sql`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${numId}
      LIMIT 1
    `;

    if (rows.length > 0) {
      return { success: true, product: rows[0] };
    }

    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getSettings(key: string = 'general') {
  try {
    const rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
    if (rows.length > 0) {
      return { success: true, settings: rows[0].value };
    }
    return { success: true, settings: {} };
  } catch (error: any) {
    // If the error is that the table doesn't exist, return empty settings
    // This allows the app to build and run before the setup is complete
    if (error.code === '42P01') {
      console.warn('Warning: "settings" table not found. Returning default settings. This is expected during initial setup.');
      return { success: true, settings: {} };
    }
    console.error('Error fetching settings:', error);
    return { success: false, error };
  }
}

export async function updateOrderStatus(orderId: string | number, status: string, paymentStatus?: string) {
  try {
    const numId = typeof orderId === 'number' ? orderId : parseInt(orderId);

    if (paymentStatus) {
      await sql`
        UPDATE orders SET status = ${status}, payment_status = ${paymentStatus}, updated_at = NOW()
        WHERE id = ${numId}
      `;
    } else {
      await sql`
        UPDATE orders SET status = ${status}, updated_at = NOW()
        WHERE id = ${numId}
      `;
    }

    return { success: true, order: { id: numId, status, payment_status: paymentStatus } };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error };
  }
}

// Review Helpers
export async function createProductReview(review: any) {
  try {
    const rows = await sql`
      INSERT INTO reviews (product_id, order_id, user_id, customer_name, customer_email, rating, review_title, review_text, verified_purchase, status, created_at, updated_at)
      VALUES (${review.product_id}, ${review.order_id || null}, ${review.user_id || null}, ${review.customer_name}, ${review.customer_email || null}, ${review.rating}, ${review.review_title || null}, ${review.review_text || null}, ${review.verified_purchase || false}, ${review.status || 'pending'}, NOW(), NOW())
      RETURNING *
    `;
    return { success: true, review: rows[0] };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error };
  }
}

export async function getProductReviews(productId: number | string) {
  try {
    const numId = typeof productId === 'number' ? productId : parseInt(productId as string);
    const rows = await sql`
      SELECT * FROM reviews
      WHERE product_id = ${numId} AND status = 'approved'
      ORDER BY created_at DESC
    `;
    return { success: true, reviews: rows };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, error };
  }
}

// Contact Message Helper
export async function createContactMessage(message: any) {
  try {
    const rows = await sql`
      INSERT INTO contact_messages (name, email, subject, message, status, created_at)
      VALUES (${message.name}, ${message.email}, ${message.subject}, ${message.message}, 'new', NOW())
      RETURNING id
    `;
    return { success: true, id: rows[0].id };
  } catch (error) {
    console.error('Error creating contact message:', error);
    return { success: false, error };
  }
}

export async function getProductReviewsByOrder(orderId: number | string) {
  try {
    const numId = typeof orderId === 'number' ? orderId : parseInt(orderId as string);
    const rows = await sql`
      SELECT * FROM reviews WHERE order_id = ${numId}
    `;
    return { success: true, reviews: rows };
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    return { success: false, error };
  }
}

// Admin Helpers - Carriers
export async function getCarriers() {
  try {
    const rows = await sql`SELECT * FROM carriers ORDER BY name`;
    return { success: true, carriers: rows };
  } catch (error) {
    return { success: false, error };
  }
}

export async function createCarrier(data: any) {
  try {
    const rows = await sql`
      INSERT INTO carriers (name, code, tracking_url_template, is_active, created_at)
      VALUES (${data.name}, ${data.code || null}, ${data.tracking_url_template || null}, ${data.is_active !== false}, NOW())
      RETURNING *
    `;
    return { success: true, carrier: rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}

// Admin Helpers - Categories
export async function createCategory(data: any) {
  try {
    const rows = await sql`
      INSERT INTO categories (name, slug, icon, image_url, created_at)
      VALUES (${data.name}, ${data.slug}, ${data.icon || null}, ${data.image_url || null}, NOW())
      RETURNING *
    `;
    return { success: true, category: rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateCategory(id: string | number, data: any) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    const rows = await sql`
      UPDATE categories
      SET name = COALESCE(${data.name}, name),
          slug = COALESCE(${data.slug}, slug),
          icon = COALESCE(${data.icon}, icon),
          image_url = COALESCE(${data.image_url}, image_url)
      WHERE id = ${numId}
      RETURNING *
    `;
    return { success: true, category: rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteCategory(id: string | number) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    await sql`DELETE FROM categories WHERE id = ${numId}`;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Admin Helpers - Contact Messages
export async function getContactMessages(limit: number = 50, offset: number = 0) {
  try {
    const rows = await sql`
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countRows = await sql`SELECT COUNT(*) as total FROM contact_messages`;
    return { success: true, messages: rows, total: parseInt(countRows[0].total) };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateContactMessage(id: string | number, data: any) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    await sql`
      UPDATE contact_messages
      SET status = COALESCE(${data.status}, status)
      WHERE id = ${numId}
    `;
    return { success: true, message: { id: numId, ...data } };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteContactMessage(id: string | number) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    await sql`DELETE FROM contact_messages WHERE id = ${numId}`;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Settings Helpers
export async function updateSettings(key: string, data: any) {
  try {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
    `;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getEmailSettings() {
  const result = await getSettings('email');
  const dbSettings = result.settings || {};

  const emailSettings = {
    smtp_host: dbSettings.smtp_host || process.env.SMTP_HOST || 'smtp.resend.com',
    smtp_port: dbSettings.smtp_port ? parseInt(dbSettings.smtp_port.toString()) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465),
    smtp_secure: dbSettings.smtp_secure !== undefined ? dbSettings.smtp_secure : (process.env.SMTP_SECURE === 'true'),
    smtp_user: dbSettings.smtp_user || process.env.SMTP_USER || 'resend',
    smtp_pass: dbSettings.smtp_pass || process.env.SMTP_PASS || '',
    email_from_name: dbSettings.email_from_name || process.env.STORE_NAME || 'My Store',
    sender_email: dbSettings.sender_email || process.env.EMAIL_FROM || 'onboarding@resend.dev',
    ...Object.keys(dbSettings).reduce((acc: any, key) => {
      if (!['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'email_from_name', 'sender_email'].includes(key)) {
        acc[key] = dbSettings[key];
      }
      return acc;
    }, {})
  };

  return { ...result, emailSettings };
}

export async function updateEmailSettings(data: any) {
  return updateSettings('email', data);
}

// Admin Orders
export async function getOrders(limit: number = 50) {
  try {
    const rows = await sql`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}
    `;
    return { success: true, orders: rows };
  } catch (error) {
    return { success: false, error };
  }
}

// Admin Products
export async function createProduct(data: any) {
  try {
    const rows = await sql`
      INSERT INTO products (name, description, price, original_price, category_id, image_url, rating, reviews_count, in_stock, stock_quantity, sku, weight, dimensions, tags, featured, created_at, updated_at)
      VALUES (
        ${data.name},
        ${data.description || null},
        ${parseFloat(data.price)},
        ${data.original_price ? parseFloat(data.original_price) : null},
        ${data.category_id || null},
        ${data.image_url || null},
        ${data.rating || 0},
        ${data.reviews_count || 0},
        ${data.in_stock !== undefined ? data.in_stock : true},
        ${parseInt(data.stock_quantity || '100')},
        ${data.sku || null},
        ${data.weight || null},
        ${data.dimensions || null},
        ${data.tags || null},
        ${data.featured || false},
        NOW(), NOW()
      )
      RETURNING *
    `;
    return { success: true, product: rows[0] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateProduct(id: string | number, data: any) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    const rows = await sql`
      UPDATE products SET
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        price = COALESCE(${data.price !== undefined ? parseFloat(data.price) : null}, price),
        original_price = ${data.original_price !== undefined ? (data.original_price ? parseFloat(data.original_price) : null) : null},
        category_id = COALESCE(${data.category_id}, category_id),
        image_url = COALESCE(${data.image_url}, image_url),
        in_stock = COALESCE(${data.in_stock}, in_stock),
        stock_quantity = COALESCE(${data.stock_quantity !== undefined ? parseInt(data.stock_quantity) : null}, stock_quantity),
        sku = COALESCE(${data.sku}, sku),
        weight = COALESCE(${data.weight}, weight),
        dimensions = COALESCE(${data.dimensions}, dimensions),
        tags = COALESCE(${data.tags}, tags),
        featured = COALESCE(${data.featured}, featured),
        updated_at = NOW()
      WHERE id = ${numId}
      RETURNING *
    `;
    return { success: true, product: rows[0] };
  } catch (error) {
    console.error('Update product error:', error);
    return { success: false, error };
  }
}

export async function deleteProduct(id: string | number) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(id);
    await sql`DELETE FROM products WHERE id = ${numId}`;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateReviewStatus(reviewId: string | number, status: string) {
  try {
    const numId = typeof reviewId === 'number' ? reviewId : parseInt(reviewId);
    await sql`
      UPDATE reviews SET status = ${status}, updated_at = NOW()
      WHERE id = ${numId}
    `;
    return { success: true, review: { id: numId, status } };
  } catch (error) {
    return { success: false, error };
  }
}

export async function removeDuplicateCarriers() {
  try {
    const result = await sql`
      DELETE FROM carriers
      WHERE id NOT IN (
        SELECT MIN(id) FROM carriers GROUP BY name
      )
    `;
    return { success: true, count: result.length };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteCarrier(id: string) {
  try {
    const numId = parseInt(id);
    await sql`DELETE FROM carriers WHERE id = ${numId}`;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function decrementStock(productId: string | number, quantity: number) {
  try {
    const numId = typeof productId === 'number' ? productId : parseInt(productId);
    await sql`
      UPDATE products
      SET stock_quantity = GREATEST(0, stock_quantity - ${quantity}),
          in_stock = (stock_quantity - ${quantity}) > 0,
          updated_at = NOW()
      WHERE id = ${numId}
    `;
    return { success: true };
  } catch (error) {
    console.error(`Error decrementing stock for product ${productId}:`, error);
    return { success: false, error };
  }
}
