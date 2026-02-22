import { neon, NeonQueryFunction } from '@neondatabase/serverless';

function buildDatabaseUrl() {
  const dbUser = process.env.PGUSER;
  const dbHost = process.env.PGHOST;
  const dbPassword = process.env.PGPASSWORD;
  const dbName = process.env.PGDATABASE;
  if (!dbUser || !dbHost || !dbPassword || !dbName) {
    throw new Error('Missing required PostgreSQL environment variables');
  }
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}/${dbName}?sslmode=require`;
}

let sql: NeonQueryFunction<false, false>;

function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || buildDatabaseUrl();
    sql = neon(databaseUrl);
  }
  return sql;
}

export interface Product { id: number; name: string; description: string; price: number; original_price?: number; category_id: number; category_slug?: string; image_url: string; rating: number; reviews_count: number; in_stock: boolean; created_at: Date | string; stock_quantity: number; sku?: string; weight?: number; dimensions?: string; tags?: string[]; featured?: boolean; }
export interface Category { id: number; name: string; slug: string; icon: string; image_url: string; created_at: Date | string; }
export interface Order { id: number; user_id?: number | string; order_number: string; customer_name: string; customer_email: string; subtotal: number; tax_amount: number; shipping_amount: number; total_amount: number; status: string; shipping_address?: any; billing_address?: any; payment_method?: string; payment_status: string; payment_intent_id?: string; stripe_payment_id?: string; tracking_number?: string; notes?: string; shipped_at?: Date | string; delivered_at?: Date | string; created_at: Date | string; updated_at: Date | string; }
export interface OrderItem { id: number; order_id: number; product_id: number; quantity: number; price: number; }
export interface Review { id: string | number; product_id: string | number; order_id?: string | number; user_id?: string | number; customer_name: string; customer_email?: string; rating: number; review_title?: string; review_text?: string; verified_purchase?: boolean; status: 'pending' | 'approved' | 'rejected'; created_at: Date; }

// --- Utility to get a single row or null ---
const first = <T,>(rows: T[]): T | null => (rows.length > 0 ? rows[0] : null);

// --- Product Functions ---
export async function getProducts(limit: number = 8, offset: number = 0, category?: string) {
  const sql = getDb();
  try {
    const query = category
      ? sql`SELECT p.*, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE c.slug = ${category} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      : sql`SELECT p.*, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const products = await query;
    return { success: true, products };
  } catch (error) { console.error(error); return { success: false, error }; }
}

export async function getProduct(id: number) {
    const sql = getDb();
    try {
        const product = first(await sql`SELECT p.*, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ${id}`);
        return product ? { success: true, product } : { success: false, error: 'Product not found' };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function createProduct(data: any) {
    const sql = getDb();
    const { name, description, price, category_id, image_url, in_stock, stock_quantity } = data;
    try {
        const result = await sql`INSERT INTO products (name, description, price, category_id, image_url, in_stock, stock_quantity) VALUES (${name}, ${description}, ${price}, ${category_id}, ${image_url}, ${in_stock}, ${stock_quantity}) RETURNING *;`;
        return { success: true, product: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function updateProduct(id: number, data: any) {
    const sql = getDb();
    // This needs to be built dynamically based on what's provided
    try {
        const result = await sql`UPDATE products SET name = ${data.name}, description = ${data.description}, price = ${data.price}, category_id = ${data.category_id}, image_url = ${data.image_url}, in_stock = ${data.in_stock}, stock_quantity = ${data.stock_quantity}, updated_at = NOW() WHERE id = ${id} RETURNING *;`;
        return { success: true, product: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function deleteProduct(id: number) {
    const sql = getDb();
    try {
        await sql`DELETE FROM products WHERE id = ${id};`;
        return { success: true };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Category Functions ---
export async function getCategories() {
  const sql = getDb();
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return { success: true, categories };
  } catch (error) { console.error(error); return { success: false, error }; }
}

export async function getCategory(slug: string) {
    const sql = getDb();
    try {
        const category = first(await sql`SELECT * FROM categories WHERE slug = ${slug}`);
        return category ? { success: true, category } : { success: false, error: 'Category not found' };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function createCategory(data: any) {
    const sql = getDb();
    const { name, slug, icon, image_url } = data;
    try {
        const result = await sql`INSERT INTO categories (name, slug, icon, image_url) VALUES (${name}, ${slug}, ${icon}, ${image_url}) RETURNING *;`;
        return { success: true, category: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function updateCategory(id: number, data: any) {
    const sql = getDb();
    const { name, slug, icon, image_url } = data;
    try {
        const result = await sql`UPDATE categories SET name = ${name}, slug = ${slug}, icon = ${icon}, image_url = ${image_url}, updated_at = NOW() WHERE id = ${id} RETURNING *;`;
        return { success: true, category: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function deleteCategory(id: number) {
    const sql = getDb();
    try {
        await sql`DELETE FROM categories WHERE id = ${id};`;
        return { success: true };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Settings Functions ---
export async function getSettings(key: string = 'general') {
    const sql = getDb();
    try {
        const row = first(await sql`SELECT value FROM settings WHERE key = ${key}`);
        return { success: true, settings: row ? row.value : {} };
    } catch (error: any) {
        if (error.code === '42P01') {
            console.warn('Warning: "settings" table not found. Returning default settings.');
            return { success: true, settings: {} };
        }
        console.error('Error fetching settings:', error);
        return { success: false, error };
    }
}

export async function updateSettings(key: string, value: any) {
    const sql = getDb();
    try {
        await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}) ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW();`;
        return { success: true };
    } catch (error) { console.error('Error saving settings:', error); return { success: false, error: 'Failed to save settings' }; }
}

// --- Carrier Functions ---
export async function getCarriers() {
    const sql = getDb();
    try {
        const carriers = await sql`SELECT * FROM carriers ORDER BY name ASC`;
        return { success: true, carriers };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function createCarrier(data: any) {
    const sql = getDb();
    const { name, enabled } = data;
    try {
        const result = await sql`INSERT INTO carriers (name, enabled) VALUES (${name}, ${enabled}) RETURNING *;`;
        return { success: true, carrier: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function deleteCarrier(id: number) {
    const sql = getDb();
    try {
        await sql`DELETE FROM carriers WHERE id = ${id};`;
        return { success: true };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function removeDuplicateCarriers() {
    const sql = getDb();
    try {
        await sql`DELETE FROM carriers WHERE id NOT IN (SELECT MIN(id) FROM carriers GROUP BY name, enabled);`;
        return { success: true };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Contact Message Functions ---
export async function getContactMessages(limit: number = 10, offset: number = 0) {
    const sql = getDb();
    try {
        const messages = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`;
        const total = first(await sql`SELECT COUNT(*) FROM contact_messages;`)?.count || 0;
        return { success: true, messages, total };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function createContactMessage(data: any) {
    const sql = getDb();
    const { name, email, message } = data;
    try {
        const result = await sql`INSERT INTO contact_messages (name, email, message) VALUES (${name}, ${email}, ${message}) RETURNING *;`;
        return { success: true, message: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function updateContactMessage(id: number, data: any) {
    const sql = getDb();
    const { status } = data;
    try {
        const result = await sql`UPDATE contact_messages SET status = ${status} WHERE id = ${id} RETURNING *;`;
        return { success: true, message: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function deleteContactMessage(id: number) {
    const sql = getDb();
    try {
        await sql`DELETE FROM contact_messages WHERE id = ${id};`;
        return { success: true };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Order Functions ---
export async function getOrders(limit: number = 10, offset: number = 0) {
    const sql = getDb();
    try {
        const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`;
        const total = first(await sql`SELECT COUNT(*) FROM orders;`)?.count || 0;
        return { success: true, orders, total };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function updateOrderStatus(id: number, status: string) {
    const sql = getDb();
    try {
        const result = await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING *;`;
        return { success: true, order: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Review Functions ---
export async function updateReviewStatus(id: number, status: string) {
    const sql = getDb();
    try {
        const result = await sql`UPDATE reviews SET status = ${status} WHERE id = ${id} RETURNING *;`;
        return { success: true, review: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function getProductReviewsByOrder(orderId: string) {
    const sql = getDb();
    try {
        const reviews = await sql`SELECT * FROM reviews WHERE order_id = ${orderId};`;
        return { success: true, reviews };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function createProductReview(data: any) {
    const sql = getDb();
    const { product_id, order_id, user_id, customer_name, rating, review_title, review_text } = data;
    try {
        const result = await sql`INSERT INTO reviews (product_id, order_id, user_id, customer_name, rating, review_title, review_text, status) VALUES (${product_id}, ${order_id}, ${user_id}, ${customer_name}, ${rating}, ${review_title}, ${review_text}, 'pending') RETURNING *;`;
        return { success: true, review: first(result) };
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Email Settings ---
export async function getEmailSettings() {
    const sql = getDb();
    try {
        const result = await getSettings('email');
        return { success: true, settings: result.settings };
    } catch (error) { console.error(error); return { success: false, error }; }
}

export async function updateEmailSettings(data: any) {
    const sql = getDb();
    try {
        return await updateSettings('email', data);
    } catch (error) { console.error(error); return { success: false, error }; }
}

// --- Setup/Seed Functions ---
export async function createTables() {
    console.log('Tables are managed via the /setup page or API.');
    return { success: true };
}

export async function seedData() {
    console.log('Seeding is managed via the /setup page or API.');
    return { success: true };
}

export async function getProductById(id: string) {
    const sql = getDb();
    try {
        const product = first(await sql`SELECT * FROM products WHERE id = ${Number(id)}`);
        return product ? { success: true, product } : { success: false, error: 'Product not found' };
    } catch (error) { console.error(error); return { success: false, error }; }
}
