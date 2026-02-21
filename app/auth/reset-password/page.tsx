'use client'

import { useState, useEffect } from 'react'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token') || ''
    setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage('Passwords do not match')
      setStatus('error')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      if (res.ok) {
        setStatus('success')
        setMessage('Password has been reset. You can now sign in.')
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || 'Failed to reset password')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to reset password')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">New Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">Confirm Password</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <button type="submit" disabled={status==='loading'} className="px-4 py-2 bg-blue-600 text-white rounded">
          {status==='loading' ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && (
        <div className="mt-4 text-sm">{message}</div>
      )}
    </div>
  )
}