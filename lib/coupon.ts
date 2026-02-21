import { CartItem } from '@/contexts/CartContext';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until?: string;
  applies_to_categories: number[];
  applies_to_products: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  error?: string;
  discount?: number;
  coupon?: Coupon;
}

/**
 * Validates a coupon code against the current cart and returns validation details
 * @param couponCode - The coupon code to validate
 * @param cartItems - Current cart items
 * @param subtotal - Current cart subtotal
 * @returns Validation result with discount amount if valid
 */
export async function validateCoupon(
  couponCode: string,
  cartItems: CartItem[],
  subtotal: number
): Promise<ValidateCouponResponse> {
  try {
    // Validate coupon using API
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, orderTotal: subtotal, items: cartItems })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      return {
        valid: false,
        error: data.error || 'Failed to validate coupon'
      };
    }
    
    return data;

  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      valid: false,
      error: 'An error occurred while validating the coupon'
    };
  }
}

/**
 * Applies a discount to the cart total
 * @param subtotal - The original subtotal
 * @param discount - The discount amount to apply
 * @returns The discounted total
 */
export function applyDiscount(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - discount);
}