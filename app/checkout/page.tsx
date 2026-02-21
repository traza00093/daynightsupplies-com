'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaymentForm from '@/components/PaymentForm'
import { Lock, Truck, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { state, dispatch } = useCart()
  const searchParams = useSearchParams()
  const [couponInfo, setCouponInfo] = useState<{ code: string; discountAmount: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [shippingEstimates, setShippingEstimates] = useState<any[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState<number | null>(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null)
  const [loadingEstimate, setLoadingEstimate] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  // Pre-fill form data from session
  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name ? session.user.name.split(' ') : ['', ''];
      setFormData(prev => ({
        ...prev,
        email: session.user.email || prev.email,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || ''
      }));
    }
  }, [session]);

  // Load carriers from API
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await fetch('/api/shipping/carriers')
        if (response.ok) {
          const data = await response.json()
          setShippingEstimates(data.carriers || [])
        }
      } catch (error) {
        console.error('Failed to fetch carriers:', error)
        // Fallback to a default carrier if API fails
        setShippingEstimates([
          { id: 1, name: 'Standard Shipping', service_name: 'Standard Delivery', base_delivery_days: 5 }
        ])
      }
    }
    fetchCarriers()
  }, [])

  // Parse coupon from URL
  useEffect(() => {
    const couponParam = searchParams.get('coupon')
    if (couponParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(couponParam))
        setCouponInfo(decoded)
      } catch (e) {
        console.error('Failed to parse coupon', e)
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Calculate shipping estimate when zip code and selected carrier change
  useEffect(() => {
    const calculateEstimate = async () => {
      if (!formData.zipCode || !selectedCarrier) {
        setEstimatedDelivery(null);
        return;
      }

      setLoadingEstimate(true);
      try {
        const response = await fetch('/api/shipping/estimate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zipCode: formData.zipCode,
            carrierId: selectedCarrier,
            country: 'US',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEstimatedDelivery(data.estimatedDelivery);
        } else {
          console.error('Failed to get shipping estimate');
          setEstimatedDelivery(null);
        }
      } catch (error) {
        console.error('Error calculating shipping estimate:', error);
        setEstimatedDelivery(null);
      } finally {
        setLoadingEstimate(false);
      }
    };

    calculateEstimate();
  }, [formData.zipCode, selectedCarrier]);

  const createOrder = async (orderData: any) => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderComplete(true)
          dispatch({ type: 'CLEAR_CART' })
          localStorage.setItem('lastOrderNumber', data.orderNumber)
        } else {
          alert(data.error || 'Order failed. Please try again.')
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Order failed. Please try again.')
      }
    } catch (error) {
      alert('Order failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          items: state.items,
          subtotal: state.total,
          discount_amount: couponInfo?.discountAmount || 0,
          coupon_code: couponInfo?.code || null,
          total_amount: state.total - (couponInfo?.discountAmount || 0),
          shipping_address: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          billing_address: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          shipping_carrier_id: selectedCarrier,
          estimated_delivery: estimatedDelivery,
          payment_method: 'card'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderComplete(true)
          dispatch({ type: 'CLEAR_CART' })
          localStorage.setItem('lastOrderNumber', data.orderNumber)
        } else {
          alert(data.error || 'Order failed. Please try again.')
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Order failed. Please try again.')
      }
    } catch (error) {
      alert('Order failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0 && !orderComplete) {
    return (
      <main className="bg-secondary-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8 bg-secondary-900 rounded-lg shadow-xl border border-secondary-800 max-w-md mx-4">
            <ShoppingBag className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
            <a href="/" className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors">
              Continue Shopping
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (orderComplete) {
    return (
      <main className="bg-secondary-950 min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] py-12">
          <div className="text-center p-8 bg-secondary-900 rounded-lg shadow-xl border border-secondary-800 max-w-lg mx-4">
            <div className="bg-green-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
            <p className="text-secondary-300 mb-6 text-lg">Thank you for your purchase. You will receive an email confirmation shortly.</p>
            {typeof window !== 'undefined' && localStorage.getItem('lastOrderNumber') && (
              <div className="bg-secondary-950 p-4 rounded-lg mb-8 border border-secondary-800 inline-block">
                <p className="text-sm text-secondary-400">
                  Order Number: <span className="font-mono font-medium text-white text-lg ml-2">{localStorage.getItem('lastOrderNumber')}</span>
                </p>
              </div>
            )}
            <div className="space-x-4 flex justify-center">
              <a href="/" className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20">Continue Shopping</a>
              <a href="/track-order" className="bg-secondary-800 text-white px-6 py-3 rounded-lg hover:bg-secondary-700 transition-colors border border-secondary-700">Track Order</a>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-secondary-950 min-h-screen">
      <Header />
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-secondary-800 pb-4">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Forms */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-secondary-900 rounded-xl shadow-lg border border-secondary-800 p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-secondary-800 p-2 rounded-lg mr-3">
                    <Truck className="h-6 w-6 text-primary-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Shipping Information</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-secondary-950 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-secondary-600 transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="mt-8 pt-8 border-t border-secondary-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Shipping Method</h3>
                    <div className="space-y-3">
                      {shippingEstimates.map((carrier) => (
                        <div
                          key={carrier.id}
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedCarrier === carrier.id
                            ? 'border-primary-500 bg-primary-900/20 shadow-[0_0_15px_rgba(var(--primary-500-rgb),0.2)]'
                            : 'border-secondary-700 bg-secondary-950 hover:border-secondary-600'
                            }`}
                          onClick={() => setSelectedCarrier(carrier.id)}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${selectedCarrier === carrier.id
                            ? 'border-primary-500'
                            : 'border-secondary-500'
                            }`}>
                            {selectedCarrier === carrier.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className={`block text-sm font-medium ${selectedCarrier === carrier.id ? 'text-primary-400' : 'text-white'}`}>
                                {carrier.name}
                              </span>
                              <span className="text-sm text-secondary-400 bg-secondary-800 px-2 py-0.5 rounded">
                                {carrier.service_name}
                              </span>
                            </div>
                            <span className="text-xs text-secondary-500 mt-1 block">
                              Estimated delivery: {carrier.base_delivery_days} business days
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Estimated Delivery Information */}
                    {selectedCarrier && formData.zipCode && (
                      <div className="mt-4 p-4 bg-secondary-800/50 rounded-lg border border-secondary-700">
                        {loadingEstimate ? (
                          <div className="flex items-center text-primary-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                            <span className="text-sm">Calculating delivery estimate...</span>
                          </div>
                        ) : estimatedDelivery ? (
                          <div className="text-sm text-primary-300">
                            <span className="font-semibold text-primary-400">Estimated Delivery:</span>{' '}
                            {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-red-400">
                            Could not estimate delivery for this location
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-secondary-800">
                    <div className="flex items-center mb-6">
                      <div className="bg-secondary-800 p-2 rounded-lg mr-3">
                        <CreditCard className="h-6 w-6 text-primary-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Payment</h2>
                    </div>

                    <PaymentForm
                      amount={state.total - (couponInfo?.discountAmount || 0)}
                      onBeforePayment={async () => {
                        // Validate forms
                        if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.zipCode) {
                          alert('Please fill in all shipping details');
                          return null;
                        }
                        if (!selectedCarrier) {
                          alert('Please select a shipping carrier');
                          return null;
                        }

                        // Create the order
                        try {
                          const orderData = {
                            customer_name: `${formData.firstName} ${formData.lastName}`,
                            customer_email: formData.email,
                            items: state.items,
                            subtotal: state.total,
                            discount_amount: couponInfo?.discountAmount || 0,
                            coupon_code: couponInfo?.code || null,
                            total_amount: state.total - (couponInfo?.discountAmount || 0),
                            shipping_address: {
                              address: formData.address,
                              city: formData.city,
                              state: formData.state,
                              zipCode: formData.zipCode
                            },
                            billing_address: {
                              address: formData.address,
                              city: formData.city,
                              state: formData.state,
                              zipCode: formData.zipCode
                            },
                            shipping_carrier_id: selectedCarrier,
                            estimated_delivery: estimatedDelivery,
                            payment_method: 'card',
                            payment_status: 'pending', // Initial status
                            user_id: session?.user?.id
                          };

                          const response = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to create order');
                          }

                          const data = await response.json();
                          if (data.success) {
                            localStorage.setItem('lastOrderNumber', data.orderNumber);
                            return { orderId: data.orderId };
                          } else {
                            alert(data.error || 'Failed to create order');
                            return null;
                          }
                        } catch (error) {
                          console.error(error);
                          alert('Failed to initiate order. Please try again.');
                          return null;
                        }
                      }}
                      onSuccess={(paymentIntentId) => {
                        // Payment successful!
                        setOrderComplete(true);
                        dispatch({ type: 'CLEAR_CART' });
                        // We could update the order status here client-side if we wanted, 
                        // but the webhook handles the critical 'paid' status update.
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-secondary-900 rounded-xl shadow-lg border border-secondary-800 p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-secondary-800 pb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover border border-secondary-800"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-secondary-900">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-secondary-400 mt-1">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)} each</p>
                      </div>
                      <div className="text-sm font-medium text-white">
                        ${((typeof item.price === 'number' ? item.price : parseFloat(item.price)) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-secondary-800 pt-6 space-y-3">
                  <div className="flex justify-between text-secondary-300">
                    <p>Subtotal</p>
                    <p className="text-white font-medium">${state.total.toFixed(2)}</p>
                  </div>

                  {couponInfo && (
                    <div className="flex justify-between text-secondary-300">
                      <p className="flex items-center text-primary-400">
                        <span className="bg-primary-900/30 text-primary-400 text-xs px-2 py-0.5 rounded mr-2 border border-primary-500/20">
                          {couponInfo.code}
                        </span>
                        Coupon
                      </p>
                      <p className="text-green-400">-${couponInfo.discountAmount.toFixed(2)}</p>
                    </div>
                  )}

                  {selectedCarrier && (
                    <div className="flex justify-between text-secondary-300">
                      <p>Shipping</p>
                      <p className="text-white font-medium">Calculated</p>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-xl text-white pt-4 border-t border-secondary-800 mt-2">
                    <p>Total</p>
                    <p className="text-primary-400">${(state.total - (couponInfo?.discountAmount || 0)).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 bg-secondary-950 p-4 rounded-lg border border-secondary-800">
                  <div className="flex items-start">
                    <Lock className="w-4 h-4 text-secondary-400 mt-0.5 mr-2" />
                    <p className="text-xs text-secondary-400">
                      Your transaction is secured with SSL encryption. We do not store your credit card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}