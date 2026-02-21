import { NextRequest } from 'next/server'
import { shippingService } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderValue, weight, zipCode } = body

    if (!orderValue || !weight || !zipCode) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const rates = await shippingService.calculateShippingRates(orderValue, weight, zipCode)

    return new Response(JSON.stringify({ rates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Shipping rates error:', error)
    return new Response(JSON.stringify({ error: 'Failed to calculate shipping rates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}