'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, MapPin, Clock, CheckCircle } from 'lucide-react'

interface TrackingEvent {
  id: number
  status: string
  location: string
  description: string
  event_time: string
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingData, setTrackingData] = useState<{
    tracking_number: string
    events: TrackingEvent[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackPackage = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/shipping/tracking/${trackingNumber}`)
      const data = await response.json()
      
      if (response.ok) {
        setTrackingData(data)
      } else {
        setError(data.error || 'Tracking information not found')
        setTrackingData(null)
      }
    } catch (error) {
      console.error('Tracking error:', error)
      setError('Failed to retrieve tracking information')
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_transit':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'label_created':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50'
      case 'in_transit':
        return 'text-blue-600 bg-blue-50'
      case 'label_created':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Package</h1>
          <p className="mt-2 text-gray-600">Enter your tracking number to see the latest updates</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Tracking
            </CardTitle>
            <CardDescription>Enter your tracking number to get real-time updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  onKeyPress={(e) => e.key === 'Enter' && trackPackage()}
                />
              </div>
              <Button 
                onClick={trackPackage} 
                disabled={loading}
                className="mt-6"
              >
                {loading ? 'Tracking...' : 'Track Package'}
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {trackingData && (
          <Card>
            <CardHeader>
              <CardTitle>Tracking Results</CardTitle>
              <CardDescription>
                Tracking Number: <span className="font-mono">{trackingData.tracking_number}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackingData.events.length > 0 ? (
                <div className="space-y-4">
                  {trackingData.events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status.replace('_', ' ').toUpperCase()}
                            </div>
                            <h3 className="font-medium mt-1">{event.description}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {new Date(event.event_time).toLocaleDateString()}
                            <br />
                            {new Date(event.event_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tracking events found for this package</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}