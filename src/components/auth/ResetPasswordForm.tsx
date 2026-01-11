'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    // Validate password strength
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}/
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
      } else {
        setSuccess(true)
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }



  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <p className="font-medium">Password updated successfully!</p>
          <p className="text-sm mt-1">
            Your password has been reset. Redirecting to sign in...
          </p>
        </Alert>
        <Link href="/auth/sign-in">
          <Button variant="secondary" className="w-full">
            Go to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={8}
          maxLength={50}
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}"
          title="Must be at least 8 characters with uppercase, lowercase, number, and special character"
        />
        <p className="text-xs text-muted-ink">
          Must be at least 8 characters with uppercase, lowercase, number, and special character
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          minLength={8}
          maxLength={50}
        />
        <p className="text-xs text-muted-ink">
          Re-enter your new password to confirm
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Updating password...' : 'Reset password'}
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
