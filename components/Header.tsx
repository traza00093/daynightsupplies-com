'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Heart, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useComparison } from '@/contexts/ComparisonContext'
import { useStoreSettings } from '@/contexts/StoreSettingsContext'
import Cart from './Cart'
import SearchBar from './SearchBar'
import ComparisonBar from './ComparisonBar'

export default function Header() {
  const { state } = useCart()
  const { state: comparisonState } = useComparison()
  const { data: session } = useSession()
  const { storeName, logoUrl } = useStoreSettings()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isComparisonBarOpen, setIsComparisonBarOpen] = useState(true)

  const hasComparisonItems = comparisonState.items.length > 0

  return (
    <>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ComparisonBar
        isOpen={hasComparisonItems && isComparisonBarOpen}
        onClose={() => setIsComparisonBarOpen(false)}
      />
      <header className={`shadow-sm border-b border-secondary-800 sticky top-0 z-40 ${hasComparisonItems && isComparisonBarOpen ? 'mt-10' : ''}`} style={{ backgroundColor: '#111111' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24 gap-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 mr-4 lg:mr-8">
              <a href="/" className="flex items-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-12 sm:h-16 md:h-16 w-auto max-w-[180px] sm:max-w-[250px] object-contain"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div className="flex items-center space-x-1 sm:space-x-2" style={{ display: logoUrl ? 'none' : 'flex' }}>
                  <span className="text-sm sm:text-lg font-bold text-white">{storeName}</span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <a href="/" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">Home</a>
              <a href="/categories" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">Categories</a>
              <a href="/bestsellers" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">Best Sellers</a>
              <a href="/new" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">New</a>
              <a href="/deals" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">Deals</a>
              <a href="/contact" className="text-gray-200 hover:text-primary-400 font-medium whitespace-nowrap transition-colors">Contact</a>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md lg:max-w-lg mx-4 lg:mx-8">
              <SearchBar />
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-200 hover:text-primary-400 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist - Hidden on small mobile */}
              {session && (
                <a href="/account/wishlist" className="hidden sm:block p-2 text-gray-200 hover:text-primary-400 transition-colors">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-gray-200 hover:text-primary-400 transition-colors"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-secondary-900 border border-secondary-700 rounded-md shadow-lg py-1 z-50">
                      {session ? (
                        <>
                          <div className="px-4 py-2 text-sm text-gray-200 border-b border-secondary-700 truncate">
                            {session.user?.name}
                          </div>
                          <a href="/account" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            My Account
                          </a>
                          <a href="/account/orders" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Orders
                          </a>
                          <a href="/account/wishlist" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Wishlist
                          </a>
                          <a href="/track-order" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Track Order
                          </a>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800"
                          >
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <a href="/auth/signin" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Sign In
                          </a>
                          <a href="/auth/signup" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Sign Up
                          </a>
                          <a href="/track-order" className="block px-4 py-2 text-sm text-gray-200 hover:bg-secondary-800">
                            Track Order
                          </a>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-200 hover:text-primary-400 relative transition-colors"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                    {state.itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-200 hover:text-primary-400 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-secondary-800">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-secondary-800" style={{ backgroundColor: '#111111' }}>
            <nav className="px-4 py-4 space-y-2">
              <a href="/" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">Home</a>
              <a href="/categories" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">Shop by Category</a>
              <a href="/bestsellers" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">Best Sellers</a>
              <a href="/new" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">New Arrivals</a>
              <a href="/deals" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">Deals of the Day</a>
              <a href="/contact" className="block py-2 text-gray-200 hover:text-primary-400 font-medium transition-colors">Contact Us</a>
              {session && (
                <a href="/account/wishlist" className="block py-2 text-gray-200 hover:text-primary-400 font-medium sm:hidden transition-colors">
                  Wishlist
                </a>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
