'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import UserEditModal from '@/components/admin/UserEditModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Activity,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  Star,
  Heart
} from 'lucide-react';

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

interface ActivityLog {
  activity_type: string;
  activity_description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface Address {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface Review {
  id: string;
  product_id: number;
  rating: number;
  title: string | null;
  review: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  status: string;
  created_at: string;
  product_name: string;
}

interface WishlistItem {
  id: string;
  product_id: number;
  added_at: string;
  product_name: string;
  price: number;
  image_url: string | null;
}

interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  added_at: string;
  updated_at: string;
  product_name: string;
  price: number;
  image_url: string | null;
}

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData(id as string);
    }
  }, [id]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setActivity(data.activity);
        setOrders(data.orders);
        setAddresses(data.addresses);
        setReviews(data.reviews);
        setWishlist(data.wishlist);
        setCart(data.cart);
      } else {
        console.error('Error fetching user data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.preferred_currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">User Details</h1>
          <p className="text-secondary-400">Loading user information...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">User Details</h1>
          <p className="text-secondary-400">User not found</p>
        </div>
      </AdminLayout>
    );
  }

  // Get user status badge
  const getUserStatus = () => {
    if (user.account_suspended) {
      return { text: 'Suspended', color: 'bg-red-900/30 text-red-400', icon: <XCircle className="w-4 h-4" /> };
    } else if (user.account_locked) {
      return { text: 'Locked', color: 'bg-orange-900/30 text-orange-400', icon: <AlertCircle className="w-4 h-4" /> };
    } else if (!user.is_active) {
      return { text: 'Inactive', color: 'bg-secondary-800 text-secondary-300', icon: <XCircle className="w-4 h-4" /> };
    } else if (!user.email_verified) {
      return { text: 'Unverified', color: 'bg-yellow-900/30 text-yellow-400', icon: <AlertCircle className="w-4 h-4" /> };
    } else {
      return { text: 'Active', color: 'bg-green-900/30 text-green-400', icon: <CheckCircle className="w-4 h-4" /> };
    }
  };

  const status = getUserStatus();

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-secondary-800 text-white rounded-md hover:bg-secondary-700 transition-colors"
            >
              Back to Users
            </button>
          </div>
        </div>
        <p className="text-secondary-400">Manage and view details for {user.email}</p>
      </div>

      {/* User Profile Header */}
      <div className="bg-secondary-900 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="w-20 h-20 rounded-full bg-secondary-800 flex items-center justify-center">
              <User className="h-10 w-10 text-secondary-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h2>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.icon}
                    <span className="ml-1">{status.text}</span>
                  </span>
                  <span className="ml-3 px-2.5 py-0.5 bg-primary-900/30 text-primary-400 text-xs font-medium rounded-full">
                    {user.account_type} ({user.tier})
                  </span>
                </div>
                <p className="text-secondary-400 mt-1">{user.email}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-secondary-800 text-white rounded-md hover:bg-secondary-700 transition-colors text-sm">
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-500 transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-lg p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{user.total_orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Spent</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(user.total_spent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Avg. Order Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(user.avg_order_value)}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Referrals</p>
              <p className="text-2xl font-bold text-white">{user.total_referrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-secondary-800">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', name: 'Profile' },
              { id: 'orders', name: 'Orders' },
              { id: 'addresses', name: 'Addresses' },
              { id: 'activity', name: 'Activity' },
              { id: 'reviews', name: 'Reviews' },
              { id: 'wishlist', name: 'Wishlist' },
              { id: 'cart', name: 'Cart' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-secondary-400 hover:text-secondary-300 hover:border-secondary-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Full Name</label>
                    <p className="mt-1 text-secondary-200">{user.first_name} {user.last_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Email</label>
                    <div className="mt-1 flex items-center">
                      <Mail className="h-4 w-4 text-secondary-400 mr-2" />
                      <p className="text-secondary-200">{user.email}</p>
                      {user.email_verified && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Phone</label>
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 text-secondary-400 mr-2" />
                      <p className="text-secondary-200">{user.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Account Type</label>
                    <p className="mt-1 text-secondary-200">{user.account_type} ({user.tier})</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Referral Code</label>
                    <p className="mt-1 text-secondary-200">{user.referral_code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Account Status</label>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        <span className="ml-1">{status.text}</span>
                      </span>
                    </div>
                  </div>

                  {user.account_suspended && user.account_suspension_reason && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-400">Suspension Reason</label>
                      <p className="mt-1 text-secondary-200">{user.account_suspension_reason}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Consent Preferences</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={user.marketing_consent}
                          disabled
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label className="ml-2 text-sm text-secondary-300">Marketing Communications</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={user.newsletter_consent}
                          disabled
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label className="ml-2 text-sm text-secondary-300">Newsletter</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={user.privacy_consent}
                          disabled
                          className="h-4 w-4 text-primary-500 rounded focus:ring-primary-500 bg-secondary-800 border-secondary-700"
                        />
                        <label className="ml-2 text-sm text-secondary-300">Privacy Policy</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Joined Date</label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-secondary-400 mr-2" />
                      <p className="text-secondary-200">{formatDate(user.customer_since)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-400">Last Login</label>
                    <div className="mt-1 flex items-center">
                      <Activity className="h-4 w-4 text-secondary-400 mr-2" />
                      <p className="text-secondary-200">
                        {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Order History</h3>

            {orders.length === 0 ? (
              <p className="text-secondary-400">No orders found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-800">
                  <thead className="bg-secondary-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Order #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-secondary-900 divide-y divide-secondary-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-secondary-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-400">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={`/admin/orders/${order.id}`} className="text-primary-400 hover:text-primary-300">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Addresses</h3>

            {addresses.length === 0 ? (
              <p className="text-secondary-400">No addresses found for this user.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-secondary-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-secondary-400 mr-1" />
                          <h4 className="font-medium text-white">
                            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                            {address.is_default && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-900/30 text-primary-400">
                                Default
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="mt-2 text-sm text-secondary-300">
                          <p>{address.first_name} {address.last_name}</p>
                          <p>{address.address_line_1}</p>
                          {address.address_line_2 && <p>{address.address_line_2}</p>}
                          <p>{address.city}, {address.state} {address.zip_code}</p>
                          <p>{address.country}</p>
                          {address.phone && <p>Phone: {address.phone}</p>}
                        </div>
                      </div>
                      <button className="text-secondary-400 hover:text-white">
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Activity Log</h3>

            {activity.length === 0 ? (
              <p className="text-secondary-400">No activity found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-800">
                  <thead className="bg-secondary-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-secondary-900 divide-y divide-secondary-800">
                    {activity.map((log, index) => (
                      <tr key={index} className="hover:bg-secondary-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-300">
                          {log.activity_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-300">
                          {log.activity_description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Reviews</h3>

            {reviews.length === 0 ? (
              <p className="text-secondary-400">No reviews found for this user.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-secondary-800 rounded-lg p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white">{review.product_name}</h4>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          review.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                        }`}>
                        {review.status}
                      </span>
                    </div>

                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-secondary-400'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-secondary-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {review.title && (
                      <p className="mt-2 font-medium text-secondary-200">{review.title}</p>
                    )}

                    {review.review && (
                      <p className="mt-1 text-secondary-300">{review.review}</p>
                    )}

                    {review.is_verified_purchase && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary-900/30 text-primary-400 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Wishlist Items</h3>

            {wishlist.length === 0 ? (
              <p className="text-secondary-400">No wishlist items found for this user.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="border border-secondary-800 rounded-lg p-4 flex">
                    <div className="flex-shrink-0 mr-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-contain rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-secondary-800 rounded flex items-center justify-center">
                          <Heart className="h-8 w-8 text-secondary-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.product_name}</h4>
                      <p className="text-secondary-400 mt-1">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-secondary-500 mt-1">Added: {formatDate(item.added_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">Cart Items</h3>

            {cart.length === 0 ? (
              <p className="text-secondary-400">No cart items found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-800">
                  <thead className="bg-secondary-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-secondary-900 divide-y divide-secondary-800">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-10 h-10 object-contain rounded mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-secondary-800 rounded mr-3 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-secondary-500" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{item.product_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                          {formatDate(item.added_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && user && (
        <UserEditModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            // Optionally show a success message
            alert('User updated successfully!');
          }}
        />
      )}
    </AdminLayout>
  );
}