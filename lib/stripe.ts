import Stripe from 'stripe';
import { getSettings } from './db';

// Create a getter function for Stripe to only initialize when needed (runtime)
let stripeInstance: Stripe | null = null;

export const getStripeInstance = async (): Promise<Stripe> => {
  if (!stripeInstance) {
    // First try to get the key from the database
    const settingsResult = await getSettings();
    let secretKey = null;
    
    if (settingsResult.success && settingsResult.settings && settingsResult.settings.stripe_secret_key) {
      secretKey = settingsResult.settings.stripe_secret_key;
    }
    
    // Fall back to environment variable if not found in database
    if (!secretKey) {
      secretKey = process.env.STRIPE_SECRET_KEY;
    }
    
    if (!secretKey) {
      throw new Error('Stripe is not configured. Please set your Stripe secret key in the admin settings or environment variables.');
    }
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover' as any,
    });
  }
  
  return stripeInstance;
};

// Synchronous version (only uses environment variable) for client-side or where async isn't appropriate
export const getStripeInstanceSync = (): Stripe | null => {
  if (stripeInstance) {
    return stripeInstance;
  }
  
  // Only use environment variable in sync version
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    return null;
  }
  
  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover' as any,
  });
  
  return stripeInstance;
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100); // Convert to cents
};

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100; // Convert from cents
};