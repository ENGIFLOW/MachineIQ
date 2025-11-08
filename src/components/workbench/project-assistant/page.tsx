'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface ProjectRequirements {
  material: string
  dimensions: string
  tolerances: string[]
  surfaceFinish: string
  quantity: number
  estimatedCycleTime: string
  toolingRecommendations: string[]
  setupNotes: string[]
  hints: string[]
}

const mockRequirements: ProjectRequirements = {
  material: '6061 Aluminum',
  dimensions: '2.5" × 1.75" × 0.5"',
  tolerances: [
    '±0.001" on critical dimensions',
    '±0.002" on non-critical features',
    'Surface finish: 32 Ra',
  ],
  surfaceFinish: '32 Ra (machined finish)',
  quantity: 25,
  estimatedCycleTime: '12-15 minutes per part',
  toolingRecommendations: [
    '1/4" end mill for roughing',
    '1/8" end mill for finishing',
    '3/16" drill for holes',
    'Chamfer tool for edges',
  ],
  setupNotes: [
    'Use vise with soft jaws for consistent clamping',
    'Set work offset at top center of stock',
    'Verify tool length offsets before running',
    'Use flood coolant for aluminum',
  ],
  hints: [
    'Start with a facing operation to ensure flat surface',
    'Use climb milling for better surface finish',
    'Consider using a fixture plate for repeatability',
    'Leave 0.010" stock for final finishing pass',
  ],
}

export default function ProjectAssistantPage() {
  const [partDescription, setPartDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [quantity, setQuantity] = useState('')
  const [requirements, setRequirements] = useState<ProjectRequirements | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!partDescription.trim()) {
      setError('Please describe the part you want to machine.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API delay with mock data
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setRequirements(mockRequirements)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate project requirements right now.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPartDescription('')
    setMaterial('')
    setQuantity('')
    setRequirements(null)
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
                  Describe your CNC project
                </h2>
                <p className="text-sm text-muted-ink">
                  Tell us about the part you need to machine, and we'll generate
                  requirements, tolerances, and planning hints.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading && !partDescription}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate project plan'}
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partDescription">Part description</Label>
              <textarea
                id="partDescription"
                value={partDescription}
                onChange={(e) => setPartDescription(e.target.value)}
                placeholder="e.g., A rectangular aluminum bracket with 4 mounting holes, 2.5 inches wide, needs to be 0.5 inches thick with chamfered edges..."
                className="w-full h-32 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition resize-none"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="material">Material (optional)</Label>
                <Input
                  id="material"
                  type="text"
                  placeholder="e.g., 6061 Aluminum"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (optional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-ink">
            Toolpath Sparks estimate: {Math.max(partDescription.length / 800, 1).toFixed(0)} (~ based on description length)
          </p>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        {requirements && (
          <section className="space-y-6">
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Project Requirements</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                    Material
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {requirements.material}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                    Dimensions
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {requirements.dimensions}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                    Surface Finish
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {requirements.surfaceFinish}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                    Estimated Cycle Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {requirements.estimatedCycleTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Tolerances</h3>
              <ul className="space-y-2">
                {requirements.tolerances.map((tolerance, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-ink"
                  >
                    <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                    <span>{tolerance}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Tooling Recommendations</h3>
              <ul className="space-y-2">
                {requirements.toolingRecommendations.map((tool, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-ink"
                  >
                    <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Setup Notes</h3>
              <ul className="space-y-2">
                {requirements.setupNotes.map((note, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-ink"
                  >
                    <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-ink">Learning Hints</h3>
              <p className="text-sm text-muted-ink">
                These hints will help guide your approach without giving away the
                complete solution.
              </p>
              <ul className="space-y-2">
                {requirements.hints.map((hint, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-2xl border border-ink/10 bg-white/80 p-3 text-sm text-ink"
                  >
                    <span className="text-[hsl(var(--accent-emerald))] mt-0.5 font-semibold">
                      💡
                    </span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <aside className="card space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recent projects</h2>
            <p className="text-xs text-muted-ink">
              Toolpath Sparks consumed last 7 days
            </p>
          </div>
          <span className="badge">Mock data</span>
        </header>
        <ul className="space-y-3">
          {[
            {
              id: 'proj-101',
              title: 'Aluminum mounting bracket',
              createdAt: 'Today • 11:30',
              sparkCost: 15,
            },
            {
              id: 'proj-099',
              title: 'Steel fixture plate',
              createdAt: 'Yesterday • 15:45',
              sparkCost: 18,
            },
            {
              id: 'proj-095',
              title: 'Brass spacer ring',
              createdAt: 'Mon • 09:12',
              sparkCost: 12,
            },
          ].map((project) => (
            <li
              key={project.id}
              className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-muted-ink"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
                <span>{project.createdAt}</span>
                <span>Generated</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">
                {project.title}
              </p>
              <p className="mt-1 text-xs text-muted-ink">
                Sparks used: {project.sparkCost}
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
      </aside>
    </div>
  )
}

