'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import { checkUserExists } from '@/lib/actions/auth'
import { syncSubscriptionFromStripe } from '@/lib/actions/subscription'

export function SignUpForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters with a special character')
      return
    } else if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      setError('Password must contain at least one special character')
      return
    }

    setLoading(true)

    try {
      // First, check if user already exists in Supabase auth
      const { exists, error: checkError } = await checkUserExists(email)

      if (checkError) {
        setError('Unable to verify email. Please try again.')
        setLoading(false)
        return
      }

      if (exists) {
        setError('An account with this email already exists. Please sign in instead.')
        setLoading(false)
        return
      }

      // User doesn't exist, proceed with account creation
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        // Double-check in case user was created between check and signup
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(signUpError.message || 'Failed to create account')
        }
      } else if (data.user) {
        setSuccess(true)
        // If email confirmation is not required, sign them in automatically
        if (data.user.email_confirmed_at) {
          // Profile should be created by trigger, but ensure it exists
          try {
            const response = await fetch('/api/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
                fullName: fullName,
              }),
            })
            if (!response.ok) {
              console.error('Failed to create profile')
            }
          } catch (err) {
            console.error('Error creating profile:', err)
          }

          // Sync subscription status from Stripe (in case they had a subscription before)
          if (data.user.email) {
            try {
              await syncSubscriptionFromStripe(data.user.id, data.user.email)
              console.log('✅ Subscription synced after sign-up')
            } catch (err) {
              console.error('Error syncing subscription after sign-up:', err)
              // Continue anyway - subscription sync is not critical
            }
          }
          
          router.push('/lessons')
          router.refresh()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert variant="success">
        <p className="font-medium">Account created successfully!</p>
        <p className="text-sm mt-1">
          Please check your email to verify your account before signing in.
        </p>
        <p className="text-sm mt-2 text-muted-ink">
          If you don't see the email, please check your spam folder.
        </p>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
          {error.includes('already exists') && (
            <div className="mt-2">
              <Link
                href="/auth/sign-in"
                className="text-sm text-[hsl(var(--spark))] font-medium hover:underline"
              >
                Sign in instead →
              </Link>
            </div>
          )}
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={8}
        />
        <p className="text-xs text-muted-ink">
          Must be at least 8 characters with a special character
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-ink">
        Already have an account?{' '}
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
