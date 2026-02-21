import { sql } from '@/lib/db-pool'

export interface ShippingCarrier {
  id: number
  name: string
  code: string
  api_endpoint?: string
  api_key?: string
  api_secret?: string
  test_mode: boolean
  active: boolean
}

export interface ShippingMethod {
  id: number
  carrier_id: number
  name: string
  service_code: string
  delivery_days: number
  price_modifier: number
  active: boolean
  carrier?: ShippingCarrier
}

export interface ShippingRate {
  id: number
  shipping_method_id: number
  shipping_zone_id: number
  min_weight: number
  max_weight: number
  rate: number
  free_shipping_threshold: number
  method?: ShippingMethod
}

export interface TrackingEvent {
  id: number
  order_id: number
  tracking_number: string
  status: string
  location: string
  description: string
  event_time: Date
}

export class ShippingService {

  async getShippingMethods(): Promise<ShippingMethod[]> {
    const rows = await sql`
      SELECT sm.*, sc.name as carrier_name, sc.code as carrier_code
      FROM shipping_methods sm
      JOIN shipping_carriers sc ON sm.carrier_id = sc.id
      WHERE sm.active = true AND sc.active = true
      ORDER BY sm.delivery_days ASC
    `
    return rows as ShippingMethod[]
  }

  async calculateShippingRates(orderValue: number, weight: number, zipCode: string): Promise<ShippingRate[]> {
    const zip = zipCode.substring(0, 5)
    const rows = await sql`
      SELECT sr.*, sm.name as method_name, sm.delivery_days, sc.name as carrier_name
      FROM shipping_rates sr
      JOIN shipping_methods sm ON sr.shipping_method_id = sm.id
      JOIN shipping_carriers sc ON sm.carrier_id = sc.id
      JOIN shipping_zones sz ON sr.shipping_zone_id = sz.id
      WHERE sr.active = true
        AND sm.active = true
        AND sc.active = true
        AND (sr.min_weight <= ${weight} AND (sr.max_weight IS NULL OR sr.max_weight >= ${weight}))
        AND (sr.min_order_value <= ${orderValue} AND (sr.max_order_value IS NULL OR sr.max_order_value >= ${orderValue}))
        AND (${zip} = ANY(sz.zip_codes) OR sz.countries @> ARRAY['US'])
      ORDER BY sr.rate ASC
    `

    return rows.map((row: any) => ({
      ...row,
      final_rate: orderValue >= row.free_shipping_threshold ? 0 : row.rate
    }))
  }

  async createShippingLabel(orderId: number, shippingMethodId: number): Promise<{ tracking_number: string, label_url: string }> {
    const rows = await sql`
      SELECT o.*, sm.service_code, sm.delivery_days, sc.code as carrier_code
      FROM orders o
      JOIN shipping_methods sm ON sm.id = ${shippingMethodId}
      JOIN shipping_carriers sc ON sm.carrier_id = sc.id
      WHERE o.id = ${orderId}
    `
    const order = rows[0]

    if (!order) throw new Error('Order not found')

    const trackingNumber = this.generateTrackingNumber(order.carrier_code)
    const labelUrl = `/api/shipping/labels/${orderId}.pdf`
    const deliveryDays = order.delivery_days || 5

    await sql`
      UPDATE orders
      SET tracking_number = ${trackingNumber},
          shipping_label_url = ${labelUrl},
          shipping_method_id = ${shippingMethodId},
          shipping_status = 'label_created',
          estimated_delivery_date = CURRENT_DATE + ${deliveryDays}::int
      WHERE id = ${orderId}
    `

    await this.addTrackingEvent(orderId, trackingNumber, 'label_created', 'Store Warehouse', 'Shipping label created')

    return { tracking_number: trackingNumber, label_url: labelUrl }
  }

  async addTrackingEvent(orderId: number, trackingNumber: string, status: string, location: string, description: string): Promise<void> {
    await sql`
      INSERT INTO shipping_tracking (order_id, tracking_number, status, location, description, event_time)
      VALUES (${orderId}, ${trackingNumber}, ${status}, ${location}, ${description}, NOW())
    `
  }

  async getTrackingEvents(trackingNumber: string): Promise<TrackingEvent[]> {
    const rows = await sql`
      SELECT * FROM shipping_tracking
      WHERE tracking_number = ${trackingNumber}
      ORDER BY event_time DESC
    `
    return rows as TrackingEvent[]
  }

  async updateOrderShippingStatus(orderId: number, status: string): Promise<void> {
    await sql`
      UPDATE orders SET shipping_status = ${status}, updated_at = NOW() WHERE id = ${orderId}
    `
  }

  private generateTrackingNumber(carrierCode: string): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()

    switch (carrierCode) {
      case 'ups':
        return `1Z${random}${timestamp.slice(-8)}`
      case 'fedex':
        return `${timestamp.slice(-12)}`
      case 'usps':
        return `9400${timestamp.slice(-12)}${random}`
      default:
        return `LS${timestamp.slice(-10)}${random}`
    }
  }

  async getShippingCarriers(): Promise<ShippingCarrier[]> {
    const rows = await sql`SELECT * FROM shipping_carriers WHERE active = true ORDER BY name`
    return rows as ShippingCarrier[]
  }

  async updateCarrierConfig(carrierId: number, config: Partial<ShippingCarrier>): Promise<void> {
    await sql`
      UPDATE shipping_carriers
      SET name = COALESCE(${config.name ?? null}, name),
          code = COALESCE(${config.code ?? null}, code),
          api_endpoint = COALESCE(${config.api_endpoint ?? null}, api_endpoint),
          api_key = COALESCE(${config.api_key ?? null}, api_key),
          api_secret = COALESCE(${config.api_secret ?? null}, api_secret),
          test_mode = COALESCE(${config.test_mode ?? null}, test_mode),
          active = COALESCE(${config.active ?? null}, active),
          updated_at = NOW()
      WHERE id = ${carrierId}
    `
  }
}

export const shippingService = new ShippingService()
