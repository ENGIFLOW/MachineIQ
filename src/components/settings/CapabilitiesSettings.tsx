'use client'

import { Card } from '@/components/ui/Card'

export function CapabilitiesSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Capabilities</h1>

      <Card className="space-y-6 p-6">
        <div>
          <h3 className="text-lg font-semibold text-ink mb-2">AI Features</h3>
          <p className="text-sm text-muted-ink mb-4">
            Manage which AI capabilities are enabled for your account
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="text-sm font-medium text-ink">G-Code Reviewer</p>
              <p className="text-xs text-muted-ink">AI-powered analysis of CNC programs</p>
            </div>
            <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--accent-emerald))]">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="text-sm font-medium text-ink">Project Assistant</p>
              <p className="text-xs text-muted-ink">Generate project requirements and planning hints</p>
            </div>
            <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--accent-emerald))]">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="text-sm font-medium text-ink">Troubleshooting Assistant</p>
              <p className="text-xs text-muted-ink">Diagnose Mastercam errors and issues</p>
            </div>
            <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--accent-emerald))]">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Scenario Simulator</p>
              <p className="text-xs text-muted-ink">Real-world manufacturing decision scenarios</p>
            </div>
            <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--accent-emerald))]">
              Enabled
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

