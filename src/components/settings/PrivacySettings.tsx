'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function PrivacySettings() {
  const [locationMetadata, setLocationMetadata] = useState(true)
  const [helpImprove, setHelpImprove] = useState(true)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--spark))]/10 text-lg font-semibold text-[hsl(var(--spark))]">
          8
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">Privacy</h1>
          <p className="text-sm text-muted-ink">Toolpath Academy believes in transparent data practices</p>
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <p className="text-sm text-muted-ink">
          Learn how your information is protected when using Toolpath Academy products, and visit our{' '}
          <a href="/privacy" className="underline hover:text-ink">Privacy Center</a> and{' '}
          <a href="/privacy-policy" className="underline hover:text-ink">Privacy Policy</a> for more details.
        </p>
        <div className="space-y-2">
          <button className="flex w-full items-center justify-between text-sm text-ink hover:text-[hsl(var(--spark))] transition">
            <span>How we protect your data</span>
            <span>›</span>
          </button>
          <button className="flex w-full items-center justify-between text-sm text-ink hover:text-[hsl(var(--spark))] transition">
            <span>How we use your data</span>
            <span>›</span>
          </button>
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <h3 className="text-lg font-semibold text-ink">Privacy settings</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">Export data</p>
            <p className="text-sm text-muted-ink">Download a copy of your account data</p>
          </div>
          <Button variant="outline">Export data</Button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">Shared chats</p>
            <p className="text-sm text-muted-ink">Manage your shared conversations</p>
          </div>
          <Button variant="outline">Manage</Button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">Memory preferences</p>
            <p className="text-sm text-muted-ink">Control what AI remembers about you</p>
          </div>
          <Button variant="outline">
            Manage
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-ink">Location metadata</p>
            <p className="text-sm text-muted-ink">
              Allow AI to use coarse location metadata (city/region) to improve product experiences.{' '}
              <a href="/privacy" className="underline hover:text-ink">Learn more</a>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLocationMetadata(!locationMetadata)}
            className={`relative ml-4 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              locationMetadata ? 'bg-[hsl(var(--spark))]' : 'bg-surface-strong'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                locationMetadata ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-6">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-ink">Help improve Toolpath Academy</p>
            <p className="text-sm text-muted-ink">
              Allow the use of your chats and coding sessions to train and improve AI models.{' '}
              <a href="/privacy" className="underline hover:text-ink">Learn more</a>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHelpImprove(!helpImprove)}
            className={`relative ml-4 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              helpImprove ? 'bg-[hsl(var(--spark))]' : 'bg-surface-strong'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                helpImprove ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  )
}

