'use client'

import { useState } from 'react'
import { GCodeEditor } from '@/components/workbench/GCode/GCodeEditor'
import { ReviewResults } from '@/components/workbench/GCode/reviewer/ReviewResults'
import { SessionHistory } from '@/components/workbench/GCode/reviewer/SessionHistory'
import { generateMockGcodeReview } from '@/lib/ai/mock'
import type { GCodeReviewResponse } from '@/lib/ai/types'

const machineProfiles = [
  { value: 'haas-vf2', label: 'HAAS VF-2 3-axis mill' },
  { value: 'dmgt-2000', label: 'DMG MORI NLX 2000 lathe' },
  { value: 'okuma-genos', label: 'Okuma GENOS M560V-5AX' },
  { value: 'custom', label: 'Custom profile…' },
]

export default function GcodeReviewerPage() {
  const [program, setProgram] = useState('')
  const [machineProfile, setMachineProfile] = useState('haas-vf2')
  const [review, setReview] = useState<GCodeReviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!program.trim()) {
      setError('Paste a CNC program to analyze.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API delay with mock data
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockResponse = generateMockGcodeReview({ program, machineProfile })
      setReview(mockResponse)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to analyze program right now.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setProgram('')
    setReview(null)
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
                  Submit a program
                </h2>
                <p className="text-sm text-muted-ink">
                  The reviewer checks for safety, cycle time, and quality
                  hazards based on your machine profile.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading && !program}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing…' : 'Analyze program'}
                </button>
              </div>
            </div>
            <label className="flex flex-col gap-1 text-sm text-muted-ink">
              Machine profile
              <select
                value={machineProfile}
                onChange={(event) => setMachineProfile(event.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-white/90 px-3 py-2 text-sm text-ink focus:border-[hsl(var(--spark))] focus:outline-none"
              >
                {machineProfiles.map((profile) => (
                  <option key={profile.value} value={profile.value}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </label>
          </header>
          <GCodeEditor value={program} onChange={setProgram} />
          <p className="text-xs text-muted-ink">
            Toolpath Sparks estimate: {Math.max(program.length / 1200, 1).toFixed(0)} (~ based on token length)
          </p>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        <ReviewResults review={review} isLoading={isLoading} />
      </div>

      <SessionHistory />
    </div>
  )
}


