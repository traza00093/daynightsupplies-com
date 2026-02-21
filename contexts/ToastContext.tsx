'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Check } from 'lucide-react'

interface ToastContextType {
    showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false)
    const [message, setMessage] = useState('')

    const showToast = (message: string) => {
        setMessage(message)
        setIsVisible(true)
        setTimeout(() => {
            setIsVisible(false)
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isVisible && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0 z-[9999] animate-slide-up w-[90%] sm:w-auto pointer-events-none">
                    <div className="bg-secondary-900 border border-primary-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm mx-auto pointer-events-auto">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
