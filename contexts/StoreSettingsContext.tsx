'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface StoreSettingsData {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeCity: string
  storeState: string
  storeZip: string
  currency: string
  timezone: string
  enableNotifications: boolean
  enableNewsletter: boolean
  enableReviews: boolean
  enableWishlist: boolean
  stripePublishableKey: string
  logoUrl: string
}

const defaultSettings: StoreSettingsData = {
  storeName: 'My Store',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  storeCity: '',
  storeState: '',
  storeZip: '',
  currency: 'USD',
  timezone: 'America/New_York',
  enableNotifications: false,
  enableNewsletter: false,
  enableReviews: false,
  enableWishlist: false,
  stripePublishableKey: '',
  logoUrl: '',
}

const StoreSettingsContext = createContext<StoreSettingsData>(defaultSettings)

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettingsData>(defaultSettings)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings)
        }
      })
      .catch(err => console.error('Failed to load store settings:', err))
  }, [])

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext)
}

export function formatAddress(settings: StoreSettingsData): string {
  const { storeAddress, storeCity, storeState, storeZip } = settings
  const cityStateZip = [storeCity, [storeState, storeZip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [storeAddress, cityStateZip].filter(Boolean).join(', ')
}
