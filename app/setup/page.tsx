'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2, Database, UserPlus, ArrowRight } from 'lucide-react'

type Step = 'checking' | 'form' | 'processing' | 'complete'

interface PasswordStrength {
  score: number
  checks: { label: string; passed: boolean }[]
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: '12+ characters', passed: password.length >= 12 },
    { label: 'Uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Number', passed: /[0-9]/.test(password) },
    { label: 'Special character', passed: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.passed).length
  return { score, checks }
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('checking')
  const [tablesExist, setTablesExist] = useState(true)
  const [needsSecret, setNeedsSecret] = useState(false)
  const [secretVerified, setSecretVerified] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')
  const [signInFailed, setSignInFailed] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    setupSecret: '',
  })

  const strength = getPasswordStrength(form.password)
  const didMount = useRef(false)

  async function checkStatus(secret?: string) {
    try {
      const secretParam = secret ? `?secret=${encodeURIComponent(secret)}` : ''
      const res = await fetch(`/api/setup/status${secretParam}`)

      if (res.status === 403) {
        setNeedsSecret(true)
        setSecretVerified(false)
        setStep('form')
        return
      }

      const data = await res.json()

      if (data.adminExists) {
        router.replace('/admin')
        return
      }

      setTablesExist(data.tablesExist)
      setNeedsSecret(false)
      setSecretVerified(true)
      setStep('form')
    } catch {
      setError('Failed to connect to server. Please check your configuration.')
      setStep('form')
    }
  }

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      checkStatus()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerifySecret = async () => {
    setError('')
    setStep('checking')

    try {
      const res = await fetch(`/api/setup/status?secret=${encodeURIComponent(form.setupSecret)}`)

      if (res.status === 403) {
        setError('Invalid setup secret. Please try again.')
        setStep('form')
        return
      }

      const data = await res.json()

      if (data.adminExists) {
        router.replace('/admin')
        return
      }

      setTablesExist(data.tablesExist)
      setSecretVerified(true)
      setStep('form')
    } catch {
      setError('Failed to verify secret. Please check your connection.')
      setStep('form')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (strength.score < 5) {
      setError('Password does not meet all requirements')
      return
    }

    setStep('processing')

    try {
      if (!tablesExist) {
        setProgressMessage('Creating database tables...')
      }

      setProgressMessage((prev) => (prev ? prev + '\n' : '') + 'Creating admin account...')

      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          firstName: form.firstName,
          lastName: form.lastName,
          setupSecret: form.setupSecret || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          router.replace('/admin')
          return
        }
        setError(data.error || 'Setup failed')
        setStep('form')
        return
      }

      setProgressMessage('Signing in...')
      setStep('complete')

      // Auto sign-in
      try {
        const signInResult = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })

        if (signInResult?.ok) {
          router.push('/admin')
        } else {
          setSignInFailed(true)
        }
      } catch {
        setSignInFailed(true)
      }
    } catch {
      setError('Setup failed. Please try again.')
      setStep('form')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Checking step
  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-secondary-400">Checking database status...</p>
        </div>
      </div>
    )
  }

  // Processing step
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-secondary-300 whitespace-pre-line">{progressMessage || 'Setting up...'}</p>
        </div>
      </div>
    )
  }

  // Complete step
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-100 mb-2">Setup Complete</h2>
          {signInFailed ? (
            <p className="text-secondary-400 mb-6">
              Your admin account has been created. Auto sign-in failed — please sign in manually.
            </p>
          ) : (
            <p className="text-secondary-400 mb-6">Your admin account has been created. Redirecting to the admin dashboard...</p>
          )}
          <a
            href={signInFailed ? '/auth/signin' : '/admin'}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {signInFailed ? 'Sign In' : 'Go to Admin Dashboard'} <ArrowRight className="w-4 h-4" />
          </a>
          {!signInFailed && (
            <p className="text-secondary-500 text-sm mt-4">
              If you are not redirected automatically,{' '}
              <a href="/auth/signin" className="text-primary-400 hover:underline">
                sign in here
              </a>.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Form step
  return (
    <div className="min-h-screen bg-secondary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-100">Store Setup</h1>
          <p className="text-secondary-400 mt-2">Create your admin account to get started</p>
        </div>

        {!tablesExist && (
          <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Database className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-secondary-200 text-sm font-medium">Database tables will be created automatically</p>
              <p className="text-secondary-400 text-sm mt-1">The schema migration will run when you submit this form.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-secondary-900 border border-secondary-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-secondary-300 mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-secondary-300 mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="admin@yourstore.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 pr-10 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Minimum 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-3 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength.score
                          ? strength.score <= 2
                            ? 'bg-red-500'
                            : strength.score <= 4
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          : 'bg-secondary-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {strength.checks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5 text-xs">
                      {check.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-secondary-500" />
                      )}
                      <span className={check.passed ? 'text-green-400' : 'text-secondary-500'}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Repeat your password"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>
            )}
          </div>

          {needsSecret && (
            <div>
              <label htmlFor="setupSecret" className="block text-sm font-medium text-secondary-300 mb-1.5">
                Setup Secret
              </label>
              <div className="flex gap-2">
                <input
                  id="setupSecret"
                  name="setupSecret"
                  type="password"
                  required
                  value={form.setupSecret}
                  onChange={handleChange}
                  className="flex-1 bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-secondary-100 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the SETUP_SECRET from your environment"
                />
                {!secretVerified && (
                  <button
                    type="button"
                    onClick={handleVerifySecret}
                    disabled={!form.setupSecret}
                    className="px-4 py-2 bg-secondary-700 text-secondary-200 rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Verify
                  </button>
                )}
              </div>
              <p className="text-secondary-500 text-xs mt-1.5">
                {secretVerified
                  ? 'Secret verified successfully.'
                  : 'This deployment requires a setup secret to proceed. Verify it before submitting.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={strength.score < 5 || form.password !== form.confirmPassword || (needsSecret && !secretVerified)}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            Create Admin Account
          </button>
        </form>

        <p className="text-center text-secondary-600 text-xs mt-6">
          This page is only available when no admin account exists.
        </p>
      </div>
    </div>
  )
}
