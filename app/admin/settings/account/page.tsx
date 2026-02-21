'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { User, Key, Mail, Save, Shield, AlertCircle } from 'lucide-react'

export default function AdminAccountSettings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileData, setProfileData] = useState({
    email: '',
    first_name: '',
    last_name: ''
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfileData({
          email: data.user.email || '',
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || ''
        })
      } else {
        setErrorMessage('Failed to load user profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setErrorMessage('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        setSuccessMessage('Profile updated successfully!')
        fetchUserProfile() // Refresh the user data
      } else {
        const data = await response.json()
        setErrorMessage(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setErrorMessage('Failed to update profile')
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      
      if (response.ok) {
        setSuccessMessage('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setErrorMessage(data.message || 'Failed to update password')
      }
    } catch (error) {
      setErrorMessage('Failed to update password')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
          <p className="text-secondary-400">Loading...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-secondary-400">Manage your admin account settings and security</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-400">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-400">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Information */}
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-secondary-700 rounded-md bg-secondary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </button>
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="bg-secondary-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-800 rounded">
              <div>
                <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-secondary-400">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-secondary-700 text-secondary-300 rounded-md hover:bg-secondary-600">
                Enable
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary-800 rounded">
              <div>
                <h3 className="font-medium text-white">Active Sessions</h3>
                <p className="text-sm text-secondary-400">Manage your active login sessions</p>
              </div>
              <button className="px-4 py-2 bg-secondary-700 text-secondary-300 rounded-md hover:bg-secondary-600">
                Manage Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}