import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getStoreSettings, formatStoreAddress } from '@/lib/settings'

export default async function TermsPage() {
  const settings = await getStoreSettings()
  const address = formatStoreAddress(settings)

  return (
    <main>
      <Header />

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using this website, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please
                do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Products and Services</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All products are subject to availability</li>
                <li>We reserve the right to limit quantities</li>
                <li>Product images are for illustration purposes only</li>
                <li>Prices are subject to change without notice</li>
                <li>We strive to display accurate product information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders and Payment</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All orders are subject to acceptance and availability</li>
                <li>Payment must be received before order processing</li>
                <li>We accept major credit cards, PayPal, and Apple Pay</li>
                <li>Prices include applicable taxes where required</li>
                <li>We reserve the right to cancel orders for any reason</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping and Delivery</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Shipping costs are calculated at checkout</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss passes to you upon delivery</li>
                <li>We are not responsible for shipping delays beyond our control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Returns and Refunds</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Returns accepted within 30 days of purchase</li>
                <li>Items must be in original condition and packaging</li>
                <li>Return shipping costs are customer's responsibility unless item is defective</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>Some items may not be eligible for return</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600">
                {settings.storeName} shall not be liable for any direct, indirect, incidental, special,
                or consequential damages resulting from the use or inability to use our products or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">
                For questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium">{settings.storeName}</p>
                {settings.storeEmail && <p className="text-gray-600">Email: {settings.storeEmail}</p>}
                {address && <p className="text-gray-600">Address: {address}</p>}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
