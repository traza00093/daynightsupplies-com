'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, CheckCircle, XCircle, AlertCircle, DollarSign, Package, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface UserStats {
  overall: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    locked_users: number;
    suspended_users: number;
    verified_users: number;
    avg_spending: number;
    avg_orders_per_user: number;
    total_orders: number;
    total_revenue: number;
    premium_users: number;
    business_users: number;
    vip_users: number;
  };
  growth: Array<{
    date: string;
    new_users: number;
  }>;
  typeDistribution: Array<{
    account_type: string;
    count: number;
  }>;
  activity: Array<{
    date: string;
    active_users: number;
  }>;
  topSpent: Array<{
    id: number;
    name: string;
    email: string;
    total_spent: number;
  }>;
}

export default function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error fetching user stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">User Statistics</h1>
          <p className="text-secondary-400">Loading user statistics...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">User Statistics</h1>
          <p className="text-secondary-400">Failed to load user statistics</p>
        </div>
      </AdminLayout>
    );
  }

  // Prepare data for charts
  const growthData = stats.growth.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    new_users: item.new_users
  })).reverse(); // Reverse to show oldest first

  const activityData = stats.activity.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    active_users: item.active_users
  })).reverse(); // Reverse to show oldest first

  const typeDistributionData = stats.typeDistribution.map(item => ({
    name: item.account_type.charAt(0).toUpperCase() + item.account_type.slice(1),
    value: item.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Statistics</h1>
        <p className="text-secondary-400">Comprehensive overview of user activity and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.overall.total_users}</p>
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
              <p className="text-2xl font-bold text-white">{stats.overall.active_users}</p>
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
              <p className="text-2xl font-bold text-white">{stats.overall.total_orders}</p>
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
                ${stats.overall.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            User Growth (Last 30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} 
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: '#93c5fd' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_users" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Active Users (Last 30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} 
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: '#93c5fd' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active_users" 
                  stroke="#10b981" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white mb-4">Account Type Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round((percent as number) * 100)}%`}
                >
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-white mb-4">Top Spent Users</h3>
          <div className="space-y-4">
            {(stats.topSpent || []).slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-secondary-800 rounded">
                <div>
                  <p className="text-white font-medium">{user.name || user.email}</p>
                  <p className="text-sm text-secondary-400">{user.email}</p>
                </div>
                <p className="text-lg font-bold text-yellow-400">
                  ${user.total_spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
            {(!stats.topSpent || stats.topSpent.length === 0) && (
              <p className="text-secondary-400 text-center py-4">No spending data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Suspended Users</p>
              <p className="text-2xl font-bold text-white">{stats.overall.suspended_users}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Locked Accounts</p>
              <p className="text-2xl font-bold text-white">{stats.overall.locked_users}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-400">Verified Users</p>
              <p className="text-2xl font-bold text-white">{stats.overall.verified_users}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}