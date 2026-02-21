'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setStatus('success')
        setMessage('If an account exists for this email, a reset link has been sent.')
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || 'Failed to send reset link')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to send reset link')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <button type="submit" disabled={status==='loading'} className="px-4 py-2 bg-blue-600 text-white rounded">
          {status==='loading' ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && (
        <div className="mt-4 text-sm">{message}</div>
      )}
    </div>
  )
}