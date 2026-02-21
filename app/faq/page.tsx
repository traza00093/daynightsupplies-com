import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getStoreSettings } from '@/lib/settings'

export default async function FAQPage() {
  const settings = await getStoreSettings()

  const faqs = [
    {
      question: "What are your shipping options?",
      answer: "We offer free standard shipping on orders over $50. Express shipping is available for $9.99 and arrives within 1-2 business days."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of purchase. Items must be in original condition with receipt. Return shipping is free for defective items."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a tracking number via email once your order ships. You can also check your order status by emailing us."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
    },
    {
      question: "How do I contact customer service?",
      answer: `Our customer service team is available 24/7 at ${settings.storeEmail}.`
    },
    {
      question: "Do you offer bulk discounts?",
      answer: `Yes! Contact us at ${settings.storeEmail} for bulk pricing on orders over $500.`
    },
    {
      question: "Are your products authentic?",
      answer: "Absolutely. We source all products directly from manufacturers and authorized distributors to guarantee authenticity."
    }
  ]

  return (
    <main>
      <Header />

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Find answers to common questions about our products and services.
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings.storeEmail && (
                <a
                  href={`mailto:${settings.storeEmail}`}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Email Support
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
