import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/db'
import { validateAdminAccess, createErrorResponse, createAdminResponse } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }
    const result = await getSettings()
    if (!result.success) {
      return createErrorResponse('Failed to load settings')
    }
    const s = result.settings || {}
    const response = {
      lowStockThreshold: parseInt(s.inventory_low_stock_threshold || '10'),
      outOfStockAlert: (s.inventory_out_of_stock_alert || 'true') === 'true',
      emailNotifications: (s.inventory_email_notifications || 'true') === 'true',
    }
    return createAdminResponse(response)
  } catch (error) {
    return createErrorResponse('Internal server error')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }
    const body = await request.json()
    const { lowStockThreshold, outOfStockAlert, emailNotifications } = body
    const toSave: Record<string, string> = {
      inventory_low_stock_threshold: String(lowStockThreshold ?? 10),
      inventory_out_of_stock_alert: String(!!outOfStockAlert),
      inventory_email_notifications: String(!!emailNotifications),
    }
    const result = await updateSettings('general', toSave)
    if (!result.success) {
      return createErrorResponse('Failed to update settings')
    }
    return createAdminResponse({ success: true })
  } catch (error) {
    return createErrorResponse('Invalid request body', 400)
  }
}