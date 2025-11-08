'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface TroubleshootingSolution {
  diagnosis: string
  confidence: number
  severity: 'critical' | 'warning' | 'info'
  steps: {
    step: number
    title: string
    description: string
    code?: string
  }[]
  relatedIssues: string[]
  preventionTips: string[]
}

const mockSolution: TroubleshootingSolution = {
  diagnosis:
    'Toolpath verification error: The toolpath is trying to cut below the stock material. This typically occurs when the stock definition is incorrect or the toolpath parameters are set incorrectly.',
  confidence: 0.92,
  severity: 'critical',
  steps: [
    {
      step: 1,
      title: 'Check stock definition',
      description:
        'Verify that your stock setup matches the actual material dimensions. Go to Machine Setup → Stock Setup and confirm the stock size and position.',
    },
    {
      step: 2,
      title: 'Review toolpath parameters',
      description:
        'In the toolpath parameters, check the "Top of stock" and "Depth" values. Ensure the depth doesn\'t exceed the stock thickness.',
    },
    {
      step: 3,
      title: 'Verify tool length',
      description:
        'Check that your tool length offset (H value) is correct. An incorrect tool length can cause the toolpath to calculate wrong depths.',
      code: 'G43 H1 Z0.1',
    },
    {
      step: 4,
      title: 'Regenerate toolpath',
      description:
        'After correcting the stock or parameters, regenerate the toolpath and verify the backplot shows the tool staying within the material bounds.',
    },
  ],
  relatedIssues: [
    'Stock definition mismatch',
    'Tool length offset error',
    'Negative depth values',
  ],
  preventionTips: [
    'Always verify stock setup before creating toolpaths',
    'Use Mastercam\'s backplot feature to visualize toolpaths before posting',
    'Double-check tool length offsets in your tool library',
  ],
}

const commonIssues = [
  {
    id: 'issue-1',
    title: 'Toolpath verification error',
    category: 'Toolpath',
    frequency: 'High',
  },
  {
    id: 'issue-2',
    title: 'Post processor not found',
    category: 'Configuration',
    frequency: 'Medium',
  },
  {
    id: 'issue-3',
    title: 'Tool library missing tools',
    category: 'Setup',
    frequency: 'High',
  },
  {
    id: 'issue-4',
    title: 'G-code simulation crashes',
    category: 'Software',
    frequency: 'Low',
  },
  {
    id: 'issue-5',
    title: 'Toolpath won\'t regenerate',
    category: 'Toolpath',
    frequency: 'Medium',
  },
]

export default function TroubleshootingPage() {
  const [errorDescription, setErrorDescription] = useState('')
  const [mastercamVersion, setMastercamVersion] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [solution, setSolution] = useState<TroubleshootingSolution | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDiagnose = async () => {
    if (!errorDescription.trim()) {
      setError('Please describe the error or issue you\'re encountering.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API delay with mock data
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSolution(mockSolution)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to diagnose the issue right now.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setErrorDescription('')
    setMastercamVersion('')
    setErrorMessage('')
    setSolution(null)
    setError(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="card space-y-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Describe your Mastercam issue
                </h2>
                <p className="text-sm text-muted-ink">
                  Tell us what error you're seeing or what problem you're
                  encountering. We'll diagnose it and walk you through the
                  solution step by step.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading && !errorDescription}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDiagnose}
                  disabled={isLoading}
                >
                  {isLoading ? 'Diagnosing...' : 'Diagnose issue'}
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="errorDescription">Error description</Label>
              <textarea
                id="errorDescription"
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                placeholder="e.g., When I try to verify my toolpath, I get an error saying the tool is cutting below the stock material..."
                className="w-full h-32 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition resize-none"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mastercamVersion">Mastercam version (optional)</Label>
                <Input
                  id="mastercamVersion"
                  type="text"
                  placeholder="e.g., Mastercam 2024"
                  value={mastercamVersion}
                  onChange={(e) => setMastercamVersion(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="errorMessage">Exact error message (optional)</Label>
                <Input
                  id="errorMessage"
                  type="text"
                  placeholder="Paste error message here"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-ink">
            Toolpath Sparks estimate: {Math.max(errorDescription.length / 600, 1).toFixed(0)} (~ based on description length)
          </p>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        {solution && (
          <section className="space-y-6">
            <div className="card space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">Diagnosis</h3>
                  <p className="mt-2 text-sm text-muted-ink">
                    {solution.diagnosis}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      solution.severity === 'critical'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : solution.severity === 'warning'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {solution.severity}
                  </span>
                  <span className="text-xs text-muted-ink">
                    Confidence: {Math.round(solution.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">
                Step-by-step solution
              </h3>
              <div className="space-y-4">
                {solution.steps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-2xl border border-ink/10 bg-white/80 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--spark))] text-sm font-semibold text-white">
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-semibold text-ink">
                          {step.title}
                        </h4>
                        <p className="text-sm text-muted-ink">
                          {step.description}
                        </p>
                        {step.code && (
                          <div className="mt-2 rounded-lg border border-ink/10 bg-surface-strong p-3">
                            <code className="text-xs font-mono text-ink">
                              {step.code}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">
                Related issues
              </h3>
              <ul className="space-y-2">
                {solution.relatedIssues.map((issue, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-ink"
                  >
                    <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">
                Prevention tips
              </h3>
              <ul className="space-y-2">
                {solution.preventionTips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-2xl border border-ink/10 bg-white/80 p-3 text-sm text-ink"
                  >
                    <span className="text-[hsl(var(--accent-emerald))] mt-0.5 font-semibold">
                      ✓
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <Card className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Common issues
              </h2>
              <p className="text-xs text-muted-ink">
                Frequently encountered problems
              </p>
            </div>
            <span className="badge">Knowledge base</span>
          </header>
          <ul className="space-y-3">
            {commonIssues.map((issue) => (
              <li
                key={issue.id}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{issue.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-ink">
                      <span>{issue.category}</span>
                      <span>•</span>
                      <span>{issue.frequency} frequency</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secondary w-full justify-center text-sm"
          >
            Browse all issues
          </button>
        </Card>

        <Card className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Recent diagnoses
              </h2>
              <p className="text-xs text-muted-ink">
                Toolpath Sparks consumed last 7 days
              </p>
            </div>
            <span className="badge">Mock data</span>
          </header>
          <ul className="space-y-3">
            {[
              {
                id: 'diag-101',
                title: 'Toolpath verification error',
                createdAt: 'Today • 14:20',
                sparkCost: 12,
              },
              {
                id: 'diag-099',
                title: 'Post processor issue',
                createdAt: 'Yesterday • 10:15',
                sparkCost: 10,
              },
              {
                id: 'diag-095',
                title: 'Tool library error',
                createdAt: 'Mon • 16:45',
                sparkCost: 8,
              },
            ].map((diagnosis) => (
              <li
                key={diagnosis.id}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-muted-ink"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
                  <span>{diagnosis.createdAt}</span>
                  <span>Resolved</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {diagnosis.title}
                </p>
                <p className="mt-1 text-xs text-muted-ink">
                  Sparks used: {diagnosis.sparkCost}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secondary w-full justify-center text-sm"
          >
            View full history
          </button>
        </Card>
      </aside>
    </div>
  )
}

