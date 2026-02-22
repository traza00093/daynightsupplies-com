
import { getDb } from '@/lib/db-pool-vercel';

// ... (interface definitions remain the same)
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


export async function getProducts(limit: number = 8, offset: number = 0, category?: string) {
  const sql = getDb();
  try {
    let query;
    if (category) {
      query = sql`
        SELECT p.*, c.slug as category_slug FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = ${category}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT p.*, c.slug as category_slug FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    const products = await query;
    return { success: true, products };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function getProduct(id: number) {
  const sql = getDb();
  try {
    const products = await sql`
      SELECT p.*, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;
    if (products.length > 0) {
      return { success: true, product: products[0] };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function getCategories() {
  const sql = getDb();
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return { success: true, categories };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function getCategory(slug: string) {
  const sql = getDb();
  try {
    const categories = await sql`SELECT * FROM categories WHERE slug = ${slug}`;
    if (categories.length > 0) {
      return { success: true, category: categories[0] };
    }
    return { success: false, error: 'Category not found' };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function getSettings(key: string = 'general') {
  const sql = getDb();
  try {
    const rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
    if (rows.length > 0) {
      return { success: true, settings: rows[0].value };
    }
    return { success: true, settings: {} };
  } catch (error: any) {
    if (error.code === '42P01') {
      console.warn('Warning: "settings" table not found. Returning default settings. This is expected during initial setup.');
      return { success: true, settings: {} };
    }
    console.error('Error fetching settings:', error);
    return { success: false, error };
  }
}
