'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Account</h1>

      <Card className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Log out of all devices</p>
            <p className="text-sm text-muted-ink">Sign out from all devices where you're currently logged in</p>
          </div>
          <Button variant="outline">Log out</Button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div>
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="text-sm text-muted-ink">Permanently delete your account and all associated data</p>
          </div>
          <a href="/contact" className="text-sm text-muted-ink underline hover:text-ink">
            Contact support
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div>
            <p className="text-sm font-medium text-ink">Organization ID</p>
            <p className="text-sm text-muted-ink">Your unique organization identifier</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg border border-ink/10 bg-surface-strong px-3 py-1.5 text-xs font-mono text-ink">
              b56fa955-31bc-44d1-a684-112e7f881dd3
            </code>
            <button
              type="button"
              className="rounded-lg border border-ink/10 bg-white p-2 hover:bg-surface-strong transition"
              title="Copy to clipboard"
            >
              <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

