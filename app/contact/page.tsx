import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MapPin, Phone, Mail, Clock, MessageCircle, Headphones } from 'lucide-react'
import { getStoreSettings, formatStoreAddress } from '@/lib/settings'

export default async function ContactPage() {
  const settings = await getStoreSettings()
  const address = formatStoreAddress(settings)

  return (
    <main className="bg-secondary-950 min-h-screen">
      <Header />

      <div className="bg-secondary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-secondary-300">
              We're here to help! Reach out to us anytime for support, questions, or feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>

              <div className="space-y-6">
                {settings.storeEmail && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary-900 p-3 rounded-lg border border-secondary-800">
                      <Mail className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Email Support</h3>
                      <p className="text-secondary-400">{settings.storeEmail}</p>
                      <p className="text-sm text-secondary-500">Response within 2-4 hours</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-900 p-3 rounded-lg border border-secondary-800">
                    <MessageCircle className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Live Chat</h3>
                    <p className="text-secondary-400">Available on our website</p>
                    <p className="text-sm text-secondary-500">Instant support during business hours</p>
                  </div>
                </div>

                {address && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary-900 p-3 rounded-lg border border-secondary-800">
                      <MapPin className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Office Address</h3>
                      <p className="text-secondary-400">{address}</p>
                      <p className="text-sm text-secondary-500">Visit us Monday - Friday, 9 AM - 6 PM</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 bg-secondary-900 rounded-lg border border-secondary-800">
                <div className="flex items-center mb-3">
                  <Headphones className="h-6 w-6 text-primary-400 mr-2" />
                  <h3 className="font-semibold text-white">24/7 Customer Support</h3>
                </div>
                <p className="text-secondary-400 text-sm">
                  Our dedicated support team is available around the clock to assist you with orders,
                  returns, product questions, and any other inquiries you may have.
                </p>
              </div>
            </div>

            <div>
              <div className="bg-secondary-900 rounded-lg shadow-sm p-8 border border-secondary-800">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

                <form className="space-y-6" id="contact-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="w-full px-3 py-2 bg-secondary-950 border border-secondary-800 text-white placeholder-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="w-full px-3 py-2 bg-secondary-950 border border-secondary-800 text-white placeholder-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 bg-secondary-950 border border-secondary-800 text-white placeholder-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Subject
                    </label>
                    <select id="subject" className="w-full px-3 py-2 bg-secondary-950 border border-secondary-800 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Support">Order Support</option>
                      <option value="Product Question">Product Question</option>
                      <option value="Return/Exchange">Return/Exchange</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-3 py-2 bg-secondary-950 border border-secondary-800 text-white placeholder-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="How can we help you today?"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20"
                  >
                    Send Message
                  </button>
                </form>

                <div id="contact-form-message" className="mt-4 hidden">
                  <div className="p-4 rounded-lg bg-green-900/30 border border-green-500/50 text-green-200">
                    <p id="contact-form-message-text"></p>
                  </div>
                </div>

                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                    document.getElementById('contact-form').addEventListener('submit', async function(e) {
                      e.preventDefault();

                      const firstName = document.getElementById('first-name').value;
                      const lastName = document.getElementById('last-name').value;
                      const email = document.getElementById('email').value;
                      const subject = document.getElementById('subject').value;
                      const message = document.getElementById('message').value;

                      const submitButton = this.querySelector('button[type="submit"]');
                      const originalText = submitButton.textContent;
                      submitButton.textContent = 'Sending...';
                      submitButton.disabled = true;

                      try {
                        const response = await fetch('/api/contact', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            subject: subject,
                            message: message
                          })
                        });

                        const result = await response.json();

                        if (response.ok) {
                          document.getElementById('contact-form-message-text').textContent = result.message;
                          document.getElementById('contact-form-message').classList.remove('hidden');
                          document.getElementById('contact-form-message').classList.add('block');

                          // Reset form
                          this.reset();
                        } else {
                          document.getElementById('contact-form-message-text').textContent = result.error || 'Failed to send message. Please try again.';
                          document.getElementById('contact-form-message').classList.remove('hidden');
                          document.getElementById('contact-form-message').classList.add('block');
                        }
                      } catch (error) {
                        document.getElementById('contact-form-message-text').textContent = 'An error occurred. Please try again.';
                        document.getElementById('contact-form-message').classList.remove('hidden');
                        document.getElementById('contact-form-message').classList.add('block');
                      } finally {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                      }
                    });
                  ` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary-900 border-t border-secondary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold text-white mb-2">What are your shipping options?</h3>
              <p className="text-secondary-400 text-sm">We offer free standard shipping on orders over $50, with express options available.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">What is your return policy?</h3>
              <p className="text-secondary-400 text-sm">Easy 30-day returns on all items in original condition with receipt.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Do you offer international shipping?</h3>
              <p className="text-secondary-400 text-sm">Currently we ship within the US, with international expansion planned.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">How can I track my order?</h3>
              <p className="text-secondary-400 text-sm">You'll receive a tracking number via email once your order ships.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
