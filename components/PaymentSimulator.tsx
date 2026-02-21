'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface PaymentSimulatorProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PaymentSimulator({ amount, onSuccess, onError }: PaymentSimulatorProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const simulatePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      onSuccess()
    } else {
      onError('Payment failed. Please try again.')
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Simulator</h3>
        <p className="text-sm text-gray-600 mb-4">
          This is a demo payment system. No real charges will be made.
        </p>
        
        <div className="bg-white p-3 rounded border mb-4">
          <p className="text-sm text-gray-700">
            <strong>Amount:</strong> ${amount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            95% success rate simulation
          </p>
        </div>

        <button
          onClick={simulatePayment}
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Simulate Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}