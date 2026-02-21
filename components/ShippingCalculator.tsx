'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Truck, Clock, DollarSign } from 'lucide-react'

interface ShippingRate {
  id: number
  method_name: string
  carrier_name: string
  delivery_days: number
  rate: number
  final_rate: number
  free_shipping_threshold: number
}

interface ShippingCalculatorProps {
  orderValue: number
  onShippingSelect: (rate: ShippingRate) => void
  selectedShipping?: ShippingRate
}

export default function ShippingCalculator({ orderValue, onShippingSelect, selectedShipping }: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState('')
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState(false)

  const calculateRates = async () => {
    if (!zipCode || zipCode.length < 5) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderValue,
          weight: 2, // Default weight - should be calculated from cart items
          zipCode
        })
      })

      const data = await response.json()
      if (data.rates) {
        setRates(data.rates)
        setCalculated(true)
        
        // Auto-select cheapest option
        if (data.rates.length > 0 && !selectedShipping) {
          onShippingSelect(data.rates[0])
        }
      }
    } catch (error) {
      console.error('Error calculating shipping:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (zipCode.length === 5) {
      calculateRates()
    }
  }, [zipCode, orderValue])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
        <CardDescription>Enter your ZIP code to see available shipping options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              maxLength={5}
            />
          </div>
          <Button 
            onClick={calculateRates} 
            disabled={loading || zipCode.length < 5}
            className="mt-6"
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>

        {calculated && rates.length > 0 && (
          <div className="space-y-3">
            <Label>Select Shipping Method</Label>
            <RadioGroup
              value={selectedShipping?.id.toString()}
              onValueChange={(value) => {
                const rate = rates.find(r => r.id.toString() === value)
                if (rate) onShippingSelect(rate)
              }}
            >
              {rates.map((rate) => (
                <div key={rate.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={rate.id.toString()} id={rate.id.toString()} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rate.method_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rate.delivery_days} business days
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {rate.final_rate === 0 ? 'FREE' : `$${rate.final_rate.toFixed(2)}`}
                        </div>
                        {rate.final_rate === 0 && rate.rate > 0 && (
                          <div className="text-xs text-green-600">
                            Free shipping on orders over ${rate.free_shipping_threshold}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {calculated && rates.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No shipping options available for this ZIP code
          </div>
        )}
      </CardContent>
    </Card>
  )
}