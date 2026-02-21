import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email().min(1).max(255);

// Password validation schema
export const passwordSchema = z.string().min(8).max(128).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
);

// Name validation schema
export const nameSchema = z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Phone validation schema
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional();

// Address validation schema
export const addressSchema = z.object({
  address_line_1: z.string().min(1).max(255),
  address_line_2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().min(2).max(50).default('US')
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  price: z.number().positive().max(999999.99),
  original_price: z.number().positive().max(999999.99).optional(),
  category_id: z.number().int().positive(),
  image_url: z.string().url().max(500).optional(),
  stock_quantity: z.number().int().min(0).max(999999),
  sku: z.string().max(100).optional(),
  weight: z.number().positive().max(9999.99).optional(),
  dimensions: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  featured: z.boolean().default(false)
});

// Order validation schema
export const orderSchema = z.object({
  customer_name: z.string().min(1).max(255),
  customer_email: emailSchema,
  subtotal: z.number().positive().max(999999.99),
  tax_amount: z.number().min(0).max(999999.99),
  shipping_amount: z.number().min(0).max(999999.99),
  total_amount: z.number().positive().max(999999.99),
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  payment_method: z.string().max(50).optional(),
  notes: z.string().max(1000).optional()
});

// User registration schema
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema,
  marketing_consent: z.boolean().default(false),
  newsletter_consent: z.boolean().default(false),
  privacy_consent: z.boolean().default(true)
});

// User update schema
export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  phone: phoneSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  marketing_consent: z.boolean().optional(),
  newsletter_consent: z.boolean().optional(),
  preferred_language: z.string().max(10).optional(),
  preferred_currency: z.string().max(10).optional()
});

// Contact message schema
export const contactMessageSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1).max(255),
  message: z.string().min(10).max(5000)
});

// Search parameters schema
export const searchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  minPrice: z.number().min(0).max(999999.99).optional(),
  maxPrice: z.number().min(0).max(999999.99).optional(),
  minRating: z.number().min(1).max(5).optional(),
  tags: z.string().max(500).optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'rating', 'created_at', 'stock_quantity', 'reviews_count']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().max(50).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ID parameter schema
export const idSchema = z.number().int().positive();

// Sanitize HTML input to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate and sanitize text input
export function validateAndSanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return sanitizeHtml(input.trim());
}

// Validate SQL ORDER BY clause to prevent injection
export function validateSortColumn(column: string, allowedColumns: string[]): string {
  if (!allowedColumns.includes(column)) {
    throw new Error(`Invalid sort column: ${column}`);
  }
  return column;
}

// Validate SQL sort order
export function validateSortOrder(order: string): 'ASC' | 'DESC' {
  const normalizedOrder = order.toUpperCase();
  if (normalizedOrder !== 'ASC' && normalizedOrder !== 'DESC') {
    throw new Error(`Invalid sort order: ${order}`);
  }
  return normalizedOrder as 'ASC' | 'DESC';
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const searchRateLimiter = new RateLimiter(50, 5 * 60 * 1000); // 50 searches per 5 minutes