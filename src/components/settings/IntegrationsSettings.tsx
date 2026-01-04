'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const integrations = [
  {
    id: 'mastercam',
    name: 'Mastercam',
    description: 'Import and export Mastercam files',
    status: 'Disconnected',
    icon: '🔧',
  },
  {
    id: 'fusion360',
    name: 'Fusion 360',
    description: 'Sync projects with Autodesk Fusion 360',
    status: 'Disconnected',
    icon: '⚙️',
  },
  {
    id: 'solidworks',
    name: 'SolidWorks',
    description: 'Import CAD files for toolpath planning',
    status: 'Disconnected',
    icon: '📐',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control for G-code programs',
    status: 'Disconnected',
    icon: '💻',
  },
]

export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Integrations</h1>
        <p className="text-sm text-muted-ink mt-2">
          Allow MachineIQ to reference other apps and services for more context.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between border-b border-ink/10 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-strong text-2xl">
                {integration.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{integration.name}</p>
                <p className="text-xs text-muted-ink">{integration.description}</p>
                <p className="text-xs text-muted-ink mt-1">{integration.status}</p>
              </div>
            </div>
            <Button variant="outline">
              Connect
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Button>
          </div>
        ))}
      </Card>

      <div className="flex gap-3">
        <Button variant="outline">Browse integrations</Button>
        <Button variant="outline">Add custom integration</Button>
      </div>
    </div>
  )
}

