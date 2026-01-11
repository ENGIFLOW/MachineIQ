'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import { checkUserExists } from '@/lib/actions/auth'
import { syncSubscriptionFromStripe } from '@/lib/actions/subscription'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check for error in URL params (e.g., account_deleted)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      if (errorParam === 'account_deleted') {
        setError('This account has been deleted. Please contact support if you believe this is an error.')
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Try to sign in with the provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Check if the error is due to invalid credentials
        if (signInError.message.includes('Invalid login credentials')) {
          // Check if user exists in the database using server action
          const { exists, error: checkError } = await checkUserExists(email)
          
          if (checkError) {
            // If check failed, show generic error
            setError('Invalid email or password. Please check your credentials.')
          } else if (!exists) {
            // User doesn't exist - show message to create account
            setError('No account found with this email. Please create an account to continue.')
          } else {
            // User exists but password is wrong
            setError('Invalid email or password. Please check your credentials.')
          }
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in. Check your inbox for the confirmation link.')
        } else {
          setError(signInError.message || 'Failed to sign in')
        }
      } else if (signInData.user) {
        // Check if account is deleted
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, deleted_at')
          .eq('id', signInData.user.id)
          .single()

        if (profile && profile.deleted_at) {
          // Account is deleted - sign out and show error
          await supabase.auth.signOut()
          setError('This account has been deleted. Please contact support if you believe this is an error.')
          setLoading(false)
          return
        }

        // Sign in successful - sync subscription status from Stripe
        if (signInData.user.email) {
          try {
            await syncSubscriptionFromStripe(signInData.user.id, signInData.user.email)
            console.log('✅ Subscription synced after sign-in')
          } catch (err) {
            console.error('Error syncing subscription after sign-in:', err)
            // Continue anyway - subscription sync is not critical for login
          }
        }
        
        router.push('/lessons')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
          {error.includes('No account found') && (
            <div className="mt-2">
              <Link
                href="/auth/sign-up"
                className="text-sm text-[hsl(var(--spark))] font-medium hover:underline"
              >
                Create an account →
              </Link>
            </div>
          )}
        </Alert>
      )}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/auth/forgot"
            className="text-xs text-[hsl(var(--spark))] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-ink">
        Don't have an account?{' '}
        <Link
          href="/auth/sign-up"
          className="text-[hsl(var(--spark))] font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}
