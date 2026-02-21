'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, User, Filter, Eye, Edit, Trash2, Activity, Calendar, DollarSign, Package, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  account_locked: boolean;
  account_suspended: boolean;
  account_type: string;
  tier: string;
  total_orders: number;
  total_spent: number;
  customer_since: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter, accountTypeFilter, currentPage, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(accountTypeFilter !== 'all' && { accountType: accountTypeFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (userId: string) => {
    window.location.href = `/admin/users/${userId}`;
  };

  const handleEditUser = (userId: string) => {
    // For now, we'll navigate to the user details page where they can be edited
    window.location.href = `/admin/users/${userId}`;
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to deactivate this user account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          fetchUsers(); // Refresh the list
        } else {
          const data = await response.json();
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error deactivating user:', error);
        alert('Error deactivating user');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

  // Get user status badge
  const getUserStatus = (user: User) => {
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

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-secondary-400">Manage and monitor registered users</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-secondary-900 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Status</label>
            <select
              className="block w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Account Type</label>
            <select
              className="block w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={accountTypeFilter}
              onChange={(e) => {
                setAccountTypeFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              <option value="all">All Types</option>
              <option value="customer">Customer</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Sort By</label>
            <select
              className="block w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
                setCurrentPage(1); // Reset to first page when sorting
              }}
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="last_login_at_desc">Last Login (Newest)</option>
              <option value="last_login_at_asc">Last Login (Oldest)</option>
              <option value="total_spent_desc">Highest Spent</option>
              <option value="total_spent_asc">Lowest Spent</option>
              <option value="total_orders_desc">Most Orders</option>
              <option value="total_orders_asc">Fewest Orders</option>
              <option value="first_name_asc">Name (A-Z)</option>
              <option value="first_name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Active Users</p>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.is_active && !u.account_locked && !u.account_suspended).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{users.reduce((sum, u) => sum + u.total_orders, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${users.reduce((sum, u) => sum + Number(u.total_spent || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-secondary-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-800">
            <thead className="bg-secondary-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-secondary-900 divide-y divide-secondary-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-secondary-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-secondary-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = getUserStatus(user);
                  return (
                    <tr key={user.id} className="hover:bg-secondary-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <User className="h-10 w-10 rounded-full bg-secondary-700 text-secondary-300 p-2" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-secondary-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        <div className="text-secondary-400">{user.account_type}</div>
                        <div className="text-secondary-500">{user.tier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          <span className="ml-1">{status.text}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        {user.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        ${Number(user.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                        {formatDate(user.customer_since)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-primary-400 hover:text-primary-300 p-1"
                            title="View User Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title="Edit User"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Deactivate User"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-secondary-800 px-6 py-3 flex items-center justify-between border-t border-secondary-800">
          <div className="text-sm text-secondary-300">
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * limit, totalCount)}
            </span>{' '}
            of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-secondary-700 text-sm font-medium rounded-md ${currentPage === 1
                ? 'bg-secondary-800 text-secondary-400 cursor-not-allowed'
                : 'bg-secondary-800 text-secondary-200 hover:bg-secondary-700'
                }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-secondary-700 text-sm font-medium rounded-md ${currentPage === totalPages
                ? 'bg-secondary-800 text-secondary-400 cursor-not-allowed'
                : 'bg-secondary-800 text-secondary-200 hover:bg-secondary-700'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}