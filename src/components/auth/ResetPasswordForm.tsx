'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset?token=`,
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
          We'll send you a link to reset your password
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
