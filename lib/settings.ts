import { getSettings } from '@/lib/db';

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeZip: string;
  currency: string;
  timezone: string;
  enableNotifications: boolean;
  enableNewsletter: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  stripePublishableKey: string;
  logoUrl: string;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const result = await getSettings();
    const s = result.settings || {};

    return {
      storeName: s.store_name || process.env.STORE_NAME || 'My Store',
      storeEmail: s.store_email || process.env.STORE_EMAIL || '',
      storePhone: s.store_phone || process.env.STORE_PHONE || '',
      storeAddress: s.store_address || process.env.STORE_ADDRESS || '',
      storeCity: s.store_city || process.env.STORE_CITY || '',
      storeState: s.store_state || process.env.STORE_STATE || '',
      storeZip: s.store_zip || process.env.STORE_ZIP || '',
      currency: s.currency || process.env.CURRENCY || 'USD',
      timezone: s.timezone || process.env.TIMEZONE || 'America/New_York',
      enableNotifications: s.enable_notifications === 'true',
      enableNewsletter: s.enable_newsletter === 'true',
      enableReviews: s.enable_reviews === 'true',
      enableWishlist: s.enable_wishlist === 'true',
      stripePublishableKey: s.stripe_publishable_key || '',
      logoUrl: s.logo_url || '',
    };
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return {
      storeName: process.env.STORE_NAME || 'My Store',
      storeEmail: process.env.STORE_EMAIL || '',
      storePhone: process.env.STORE_PHONE || '',
      storeAddress: process.env.STORE_ADDRESS || '',
      storeCity: process.env.STORE_CITY || '',
      storeState: process.env.STORE_STATE || '',
      storeZip: process.env.STORE_ZIP || '',
      currency: process.env.CURRENCY || 'USD',
      timezone: process.env.TIMEZONE || 'America/New_York',
      enableNotifications: false,
      enableNewsletter: false,
      enableReviews: false,
      enableWishlist: false,
      stripePublishableKey: '',
      logoUrl: '',
    };
  }
}

export function formatStoreAddress(settings: StoreSettings): string {
  const parts = [settings.storeAddress, settings.storeCity, settings.storeState, settings.storeZip].filter(Boolean);
  if (parts.length === 0) return '';
  // Format as "Address, City, State Zip"
  const { storeAddress, storeCity, storeState, storeZip } = settings;
  const cityStateZip = [storeCity, [storeState, storeZip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [storeAddress, cityStateZip].filter(Boolean).join(', ');
}
