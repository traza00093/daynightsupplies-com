import './globals.css'
import { Inter } from 'next/font/google'
import { CartProvider } from '@/contexts/CartContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { StoreSettingsProvider } from '@/contexts/StoreSettingsContext'
import { AuthProvider } from '@/components/AuthProvider'
import { getStoreSettings } from '@/lib/settings'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1f2937',
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  return {
    title: `${settings.storeName} - Online Store`,
    description: `Shop quality products at ${settings.storeName}.`,
    ...(settings.logoUrl ? {
      icons: {
        icon: settings.logoUrl,
        apple: settings.logoUrl,
      },
    } : {}),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: settings.storeName,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} no-overscroll bg-cream-50`}>
        <AuthProvider>
          <StoreSettingsProvider>
            <CartProvider>
              <ComparisonProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ComparisonProvider>
            </CartProvider>
          </StoreSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
