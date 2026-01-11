'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_link') {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Always use production domain for password reset links
      // Password reset emails should point to production, not localhost
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vietmastercamtraining.com'
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/auth/reset`,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <p className="font-medium">Reset link sent!</p>
          <p className="text-sm mt-1">
            Check your email for instructions to reset your password.
            <span className="text-muted-ink/80 block mt-1">If you don't see the email, please check your spam folder.</span>
          </p>
        </Alert>
        <Link href="/auth/sign-in">
          <Button variant="secondary" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-ink">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-muted-ink">
        Remember your password?{' '}
        <Link
          href="/auth/sign-in"
          className="text-[hsl(var(--spark))] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
