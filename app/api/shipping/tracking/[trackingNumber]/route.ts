import { NextRequest } from 'next/server'
import { shippingService } from '@/lib/shipping'

export async function GET(request: NextRequest, { params }: { params: { trackingNumber: string } }) {
  try {
    const trackingNumber = params.trackingNumber

    if (!trackingNumber) {
      return new Response(JSON.stringify({ error: 'Tracking number required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const events = await shippingService.getTrackingEvents(trackingNumber)

    return new Response(JSON.stringify({ tracking_number: trackingNumber, events }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Tracking error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get tracking information' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}