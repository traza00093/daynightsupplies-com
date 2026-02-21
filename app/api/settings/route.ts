import { NextRequest } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await getSettings();

    if (!result.success) {
      return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    const s = result.settings || {};

    // Only return public settings that are safe to expose to the frontend
    const publicSettings = {
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

    return Response.json({ settings: publicSettings });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
