'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function PrivacySettings() {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--spark))]/10 text-lg font-semibold text-[hsl(var(--spark))]">
          8
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">Privacy</h1>
          <p className="text-sm text-muted-ink">VietMastercam Training believes in transparent data practices</p>
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <p className="text-sm text-muted-ink">
          Learn how your information is protected when using VietMastercam Training products, and visit our{' '}
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
        <p className="text-sm text-muted-ink">
          Your privacy is important to us. Visit our{' '}
          <a href="/privacy" className="underline hover:text-ink">Privacy Policy</a> for more information.
        </p>
      </Card>
    </div>
  )
}

