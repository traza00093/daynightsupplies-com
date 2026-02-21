import { NextRequest } from 'next/server'
import { getSettings, updateSettings } from '@/lib/db'
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth'
import { ensureDatabaseInitialized } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized()
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const result = await getSettings()

    if (!result.success) {
      console.error('Failed to fetch settings:', result.error)
      return Response.json({ error: 'Failed to fetch settings', details: String(result.error) }, { status: 500 })
    }

    // Map the settings from the database to the expected format
    const settings = {
      storeName: result.settings?.store_name || process.env.STORE_NAME || '',
      storeEmail: result.settings?.store_email || process.env.STORE_EMAIL || '',
      storeAddress: result.settings?.store_address || process.env.STORE_ADDRESS || '',
      storeCity: result.settings?.store_city || process.env.STORE_CITY || '',
      storeState: result.settings?.store_state || process.env.STORE_STATE || '',
      storeZip: result.settings?.store_zip || process.env.STORE_ZIP || '',
      currency: result.settings?.currency || 'USD',
      timezone: result.settings?.timezone || 'America/New_York',
      enableNotifications: result.settings?.enable_notifications === 'true',
      enableNewsletter: result.settings?.enable_newsletter === 'true',
      enableReviews: result.settings?.enable_reviews === 'true',
      enableWishlist: result.settings?.enable_wishlist === 'true',
      stripePublishableKey: result.settings?.stripe_publishable_key || '',
      stripeSecretKey: '', // Don't return the secret key
      stripeWebhookSecret: '', // Don't return the webhook secret
      // Add flags to indicate if keys are set
      isStripeSecretKeySet: !!result.settings?.stripe_secret_key,
      isStripeWebhookSecretSet: !!result.settings?.stripe_webhook_secret,
      simpleShippingEnabled: result.settings?.simple_shipping_enabled === 'true',
      simpleShippingText: result.settings?.simple_shipping_text || 'Free shipping, normally shipped within 3-5 days',
      logoUrl: result.settings?.logo_url || '',
    }

    return createAdminResponse({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return createErrorResponse('Failed to fetch settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request);
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status);
    }

    const settingsData = await request.json()

    // Transform the settings to match the database key format
    const transformedSettings: Record<string, string> = {
      store_name: settingsData.storeName,
      store_email: settingsData.storeEmail,
      store_address: settingsData.storeAddress,
      store_city: settingsData.storeCity,
      store_state: settingsData.storeState,
      store_zip: settingsData.storeZip,
      currency: settingsData.currency,
      timezone: settingsData.timezone,
      enable_notifications: String(settingsData.enableNotifications),
      enable_newsletter: String(settingsData.enableNewsletter),
      enable_reviews: String(settingsData.enableReviews),
      enable_wishlist: String(settingsData.enableWishlist),
      stripe_publishable_key: settingsData.stripePublishableKey || '',
      // Only update Stripe keys if they are provided and not empty (for security)
      ...(settingsData.stripeSecretKey && { stripe_secret_key: settingsData.stripeSecretKey }),
      ...(settingsData.stripeWebhookSecret && { stripe_webhook_secret: settingsData.stripeWebhookSecret }),
      simple_shipping_enabled: String(settingsData.simpleShippingEnabled),
      simple_shipping_text: settingsData.simpleShippingText,
      logo_url: settingsData.logoUrl || '',
    }

    const result = await updateSettings('general', transformedSettings)

    if (!result.success) {
      return Response.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return createAdminResponse({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return createErrorResponse('Failed to update settings');
  }
}