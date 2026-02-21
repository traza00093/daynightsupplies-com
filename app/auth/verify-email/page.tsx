'use client'

import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    async function verify() {
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        if (res.ok) {
          setStatus('success')
          setMessage('Your email has been verified. You can now sign in.')
        } else {
          const data = await res.json()
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('Verification failed')
      }
    }
    verify()
  }, [])

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      {status === 'idle' && <p>Verifying...</p>}
      {message && <p className="mt-2">{message}</p>}
    </div>
  )
}