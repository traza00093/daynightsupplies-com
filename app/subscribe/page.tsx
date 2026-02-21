'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Check, Star } from 'lucide-react'

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: number
  interval_type: string
  interval_count: number
  trial_period_days: number
  features: any
  is_active: boolean
}

export default function SubscribePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: number) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Subscription created successfully!')
        }
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
      alert('Failed to create subscription')
    }
  }

  const formatInterval = (type: string, count: number) => {
    const unit = count === 1 ? type : `${type}s`
    return count === 1 ? `per ${unit}` : `every ${count} ${unit}`
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">Get regular deliveries of your favorite products</p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No subscription plans available at the moment.</p>
              <a href="/" className="text-blue-600 hover:text-blue-800">Continue Shopping</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div 
                  key={plan.id} 
                  className={`bg-white rounded-lg shadow-lg p-8 relative ${
                    index === 1 ? 'ring-2 ring-blue-500 transform scale-105' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-2">{formatInterval(plan.interval_type, plan.interval_count)}</span>
                    </div>
                    {plan.trial_period_days > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        {plan.trial_period_days} days free trial
                      </p>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                    <ul className="space-y-3">
                      {plan.features && Array.isArray(plan.features) ? (
                        plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-gray-600">Regular deliveries</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-gray-600">Free shipping</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-gray-600">Cancel anytime</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      index === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time from your account settings.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How does billing work?</h3>
                <p className="text-gray-600">You'll be charged automatically based on your selected plan interval.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if I'm not satisfied?</h3>
                <p className="text-gray-600">We offer a satisfaction guarantee. Contact us if you're not happy with your subscription.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}