import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getOrders, updateOrderStatus } from '@/lib/db'
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await getOrders(limit)

    if (result.success) {
      const orders = result.orders?.map((order: any) => ({
        ...order,
        created_at: order.created_at?.toDate ? order.created_at.toDate().toISOString() : order.created_at,
        updated_at: order.updated_at?.toDate ? order.updated_at.toDate().toISOString() : order.updated_at,
      }))
      return createAdminResponse({ orders })
    } else {
      return createErrorResponse('Failed to fetch orders')
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
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
    const { id, status } = body

    if (!id || !status) {
      return createErrorResponse('Order ID and status required', 400)
    }

    const result = await updateOrderStatus(id, status)

    if (result.success) {
      return createAdminResponse({ order: result.order })
    } else {
      return createErrorResponse('Failed to update order status')
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return createErrorResponse('Invalid request body', 400)
  }
}