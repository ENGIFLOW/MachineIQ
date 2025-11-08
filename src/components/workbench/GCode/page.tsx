'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const quickLinks = [
  {
    href: '/workbench/reviewer',
    title: 'Start with a G-code review',
    description:
      'Paste your CNC program and get instant feedback on safety risks, inefficiencies, and optimization ideas.',
  },
  {
    href: '/workbench/project-assistant',
    title: 'Plan a new CNC project',
    description:
      'Describe the part you need to machine and let the AI craft requirements, tolerances, and hint scaffolding.',
  },
]

const workbenchNav = [
  { href: '/workbench/reviewer', label: 'G-Code Reviewer' },
  { href: '/workbench/project-assistant', label: 'Project Assistant' },
  { href: '/workbench/troubleshooting', label: 'Troubleshooting' },
  { href: '/workbench/scenarios', label: 'Scenario Simulator' },
]

export default function WorkbenchHome() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <span className="badge">AI Workbench</span>
        <h1 className="text-3xl font-semibold text-ink">
          Your digital CNC operations coach
        </h1>
        <p className="max-w-2xl text-sm text-muted-ink">
          Review toolpaths, generate project briefs, troubleshoot Mastercam
          snags, and simulate real-world production scenarios from one hub.
        </p>
      </div>

      <nav className="flex flex-wrap gap-3">
        {workbenchNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-muted-ink transition hover:border-[hsl(var(--spark))] hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        {quickLinks.map((quickLink) => (
          <Card key={quickLink.href} className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">{quickLink.title}</h2>
            <p className="text-sm text-muted-ink">{quickLink.description}</p>
            <Link href={quickLink.href}>
              <Button className="w-fit">Open tool</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}


