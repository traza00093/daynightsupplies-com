import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { shippingService } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { orderId, shippingMethodId } = body

    if (!orderId || !shippingMethodId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await shippingService.createShippingLabel(orderId, shippingMethodId)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Shipping label error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create shipping label' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}