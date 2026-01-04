'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export function UsageSettings() {
  const [extraUsage, setExtraUsage] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Usage</h1>

      <Card className="space-y-6 p-6">
        <div>
          <h3 className="text-lg font-semibold text-ink mb-4">Plan usage limits</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-ink">Current session</p>
                  <p className="text-xs text-muted-ink">Resets in 1 hr 6 min</p>
                </div>
                <span className="text-sm font-medium text-ink">34% used</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div className="h-full rounded-full bg-[hsl(var(--spark))]" style={{ width: '34%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-ink/10">
              <div className="mb-2">
                <p className="text-sm font-medium text-ink mb-1">Weekly limits</p>
                <a href="/help" className="text-xs text-[hsl(var(--spark))] underline hover:no-underline">
                  Learn more about usage limits
                </a>
              </div>
              
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-ink">All models</p>
                    <span className="text-sm text-ink">17% used</span>
                  </div>
                  <p className="text-xs text-muted-ink mb-2">Resets in 20 hr 6 min</p>
                  <div className="h-2 rounded-full bg-surface-strong">
                    <div className="h-full rounded-full bg-[hsl(var(--spark))]" style={{ width: '17%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-ink">Sparks</p>
                      <button className="text-muted-ink hover:text-ink" title="Info">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-ink">0% used</span>
                  </div>
                  <p className="text-xs text-muted-ink mb-2">You haven't used Sparks yet this week</p>
                  <div className="h-2 rounded-full bg-surface-strong">
                    <div className="h-full rounded-full bg-[hsl(var(--spark))]" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ink/10 flex items-center gap-2 text-xs text-muted-ink">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.5m0 0H9m-4.5 0a5.5 5.5 0 100 11H9m-4.5-11v11m0 0H9m0 0v-5m0 5h4.5m0 0a5.5 5.5 0 110-11H15m-1.5 0v11m0 0H15m0 0v-5" />
            </svg>
            <span>Last updated: just now</span>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ink mb-1">Extra usage</h3>
            <p className="text-sm text-muted-ink">
              Use a wallet to pay for extra usage when you exceed your subscription limits
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExtraUsage(!extraUsage)}
            className={`relative ml-4 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              extraUsage ? 'bg-[hsl(var(--spark))]' : 'bg-surface-strong'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                extraUsage ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  )
}

