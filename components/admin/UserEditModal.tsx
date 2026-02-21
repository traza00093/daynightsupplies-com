'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Lock, Unlock, UserX, UserCheck } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  account_locked: boolean;
  account_suspended: boolean;
  account_suspension_reason: string | null;
  account_type: string;
  tier: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  customer_since: string;
  created_at: string;
  updated_at: string;
  preferred_language: string;
  preferred_currency: string;
  marketing_consent: boolean;
  newsletter_consent: boolean;
  privacy_consent: boolean;
  referral_code: string;
  total_referrals: number;
  affiliate_commission: number;
}

interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const accountTypes = ['customer', 'premium', 'business', 'vip'];
const tiers = ['basic', 'silver', 'gold', 'platinum', 'diamond'];
const languages = ['en', 'es', 'fr', 'de'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<User>({ ...user });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the API to update the user
      const response = await fetch(`/api/admin/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            is_active: formData.is_active,
            email_verified: formData.email_verified,
            account_locked: formData.account_locked,
            account_suspended: formData.account_suspended,
            account_suspension_reason: formData.account_suspension_reason,
            account_type: formData.account_type,
            tier: formData.tier,
            preferred_language: formData.preferred_language,
            preferred_currency: formData.preferred_currency,
            marketing_consent: formData.marketing_consent,
            newsletter_consent: formData.newsletter_consent,
            privacy_consent: formData.privacy_consent,
          }
        }),
      });

      if (response.ok) {
        onSave(formData);
        onClose();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to update user'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-secondary-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Edit User Details
                  </h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300">First Name</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-secondary-500" />
                        </div>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Last Name</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-secondary-500" />
                        </div>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Email</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-secondary-500" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Phone</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-secondary-500" />
                        </div>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Address</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-secondary-500" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">ZIP Code</label>
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code || ''}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Account Type</label>
                      <select
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      >
                        {accountTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Tier</label>
                      <select
                        name="tier"
                        value={formData.tier}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      >
                        {tiers.map(tier => (
                          <option key={tier} value={tier}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Language</label>
                      <select
                        name="preferred_language"
                        value={formData.preferred_language}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      >
                        {languages.map(lang => (
                          <option key={lang} value={lang}>
                            {lang.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-300">Currency</label>
                      <select
                        name="preferred_currency"
                        value={formData.preferred_currency}
                        onChange={handleChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-300">Suspension Reason</label>
                      <textarea
                        name="account_suspension_reason"
                        value={formData.account_suspension_reason || ''}
                        onChange={handleChange}
                        rows={2}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 sm:text-sm border-secondary-700 rounded-md bg-secondary-800 text-white"
                        placeholder="Reason for suspension (if applicable)"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-white mb-3">Account Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-secondary-300 flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Active Account
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="email_verified"
                          name="email_verified"
                          type="checkbox"
                          checked={formData.email_verified}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="email_verified" className="ml-2 block text-sm text-secondary-300 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email Verified
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="account_locked"
                          name="account_locked"
                          type="checkbox"
                          checked={formData.account_locked}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="account_locked" className="ml-2 block text-sm text-secondary-300 flex items-center">
                          <Lock className="h-4 w-4 mr-1" />
                          Account Locked
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="account_suspended"
                          name="account_suspended"
                          type="checkbox"
                          checked={formData.account_suspended}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="account_suspended" className="ml-2 block text-sm text-secondary-300 flex items-center">
                          <UserX className="h-4 w-4 mr-1" />
                          Account Suspended
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-white mb-3">Communication Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <input
                          id="marketing_consent"
                          name="marketing_consent"
                          type="checkbox"
                          checked={formData.marketing_consent}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="marketing_consent" className="ml-2 block text-sm text-secondary-300">
                          Marketing Emails
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="newsletter_consent"
                          name="newsletter_consent"
                          type="checkbox"
                          checked={formData.newsletter_consent}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="newsletter_consent" className="ml-2 block text-sm text-secondary-300">
                          Newsletter
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="privacy_consent"
                          name="privacy_consent"
                          type="checkbox"
                          checked={formData.privacy_consent}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label htmlFor="privacy_consent" className="ml-2 block text-sm text-secondary-300">
                          Privacy Policy
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-500 text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-700 shadow-sm px-4 py-2 bg-secondary-800 text-base font-medium text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}