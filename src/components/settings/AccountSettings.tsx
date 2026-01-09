'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createClient } from '@/lib/supabase/client'
import { deleteAccount } from '@/lib/actions/profile'
import type { User } from '@supabase/supabase-js'

export function AccountSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleDeleteAccount = async () => {
    // Validate confirmation text
    const expectedText = `DELETE ${user?.email || ''}`
    if (confirmationText !== expectedText) {
      setError(`Please type "${expectedText}" to confirm deletion`)
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const result = await deleteAccount()

      if (result.success) {
        // Redirect to home page after successful deletion
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete account. Please contact support.')
        setDeleting(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-ink">Account</h1>
        <Card className="p-6">
          <p className="text-muted-ink">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Account</h1>

      <Card className="space-y-6 p-6">
        {/* Email Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Email</p>
            <p className="text-sm text-muted-ink">Your account email address</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg border border-ink/10 bg-surface-strong px-3 py-1.5 text-xs font-mono text-ink">
              {user?.email || 'Not available'}
            </code>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div>
            <p className="text-sm font-medium text-ink">Log out of all devices</p>
            <p className="text-sm text-muted-ink">Sign out from all devices where you're currently logged in</p>
          </div>
          <Button variant="outline">Log out</Button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="text-sm text-muted-ink">
              Delete your account and anonymize your personal information. Your subscription and payment records will be retained for legal and accounting purposes, but will no longer be associated with your personal data.
            </p>
            {showConfirm && (
              <Alert variant="error" className="mt-4">
                <p className="font-medium mb-2">Are you sure you want to delete your account?</p>
                <p className="text-sm mb-4">
                  This will:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 mb-4">
                  <li>Anonymize your email and name</li>
                  <li>Sign you out immediately</li>
                  <li>Remove access to your account</li>
                  <li>Retain subscription and payment records (for compliance)</li>
                </ul>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delete-confirmation" className="text-sm font-medium text-ink mb-2 block">
                      To confirm, type <strong>DELETE {user?.email || ''}</strong>
                    </Label>
                    <Input
                      id="delete-confirmation"
                      type="text"
                      value={confirmationText}
                      onChange={(e) => {
                        setConfirmationText(e.target.value)
                        setError(null)
                      }}
                      placeholder={`DELETE ${user?.email || ''}`}
                      disabled={deleting}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleDeleteAccount}
                      disabled={deleting || confirmationText !== `DELETE ${user?.email || ''}`}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConfirm(false)
                        setConfirmationText('')
                        setError(null)
                      }}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
            {error && (
              <Alert variant="error" className="mt-4">
                <p className="text-sm whitespace-pre-wrap break-words">{error}</p>
              </Alert>
            )}
          </div>
          {!showConfirm && (
            <Button
              variant="outline"
              onClick={() => setShowConfirm(true)}
              className="ml-4"
            >
              Delete account
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

