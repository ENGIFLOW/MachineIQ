'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface Scenario {
  id: string
  title: string
  description: string
  constraints: string[]
  timeLimit?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface ScenarioResponse {
  decision: string
  reasoning: string
  timeSpent: number
}

interface ScenarioFeedback {
  score: number
  strengths: string[]
  improvements: string[]
  alternativeSolutions: string[]
  timeAnalysis: string
}

const mockScenarios: Scenario[] = [
  {
    id: 'scenario-1',
    title: 'Production Crisis',
    description:
      'You have 100 parts due in 8 hours for a critical customer order. Your primary end mill just broke during the first part, and you don\'t have a direct replacement in stock. The customer needs these parts for an assembly line that starts tomorrow morning.',
    constraints: [
      '8 hours until deadline',
      'No direct tool replacement available',
      'Customer is a key account',
      'Assembly line depends on these parts',
    ],
    timeLimit: 15,
    difficulty: 'intermediate',
  },
  {
    id: 'scenario-2',
    title: 'Material Shortage',
    description:
      'You\'re halfway through a 50-part run when you realize you only have enough material for 30 more parts. The material supplier is closed for the weekend, and the job needs to be completed by Monday morning.',
    constraints: [
      '25 parts already completed',
      'Material supplier closed',
      'Monday morning deadline',
      'No alternative material sources nearby',
    ],
    timeLimit: 10,
    difficulty: 'beginner',
  },
  {
    id: 'scenario-3',
    title: 'Quality Issue Discovery',
    description:
      'After completing 40 parts, quality control discovers that the last 10 parts have a dimensional error. The customer requires all parts to be within spec, but you\'ve already used the allocated material budget.',
    constraints: [
      '30 good parts, 10 defective',
      'Material budget exhausted',
      'Customer requires 100% quality',
      'No additional material budget',
    ],
    timeLimit: 12,
    difficulty: 'advanced',
  },
]

const mockFeedback: ScenarioFeedback = {
  score: 85,
  strengths: [
    'Quick identification of alternative solutions',
    'Good consideration of customer relationship impact',
    'Realistic time estimation',
  ],
  improvements: [
    'Could have considered tool modification/regrinding as an option',
    'Should have factored in setup time for alternative tool',
    'Missing consideration of quality impact with substitute tool',
  ],
  alternativeSolutions: [
    'Contact customer immediately to negotiate deadline extension',
    'Use similar tool with adjusted feeds/speeds and test on one part first',
    'Check if parts can be machined in two operations with available tools',
    'Explore tool regrinding or modification if time permits',
  ],
  timeAnalysis:
    'You took 8 minutes to respond. For this scenario, an optimal response time is 5-7 minutes. You showed good deliberation but could improve speed with more practice.',
}

export default function ScenarioSimulatorPage() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [decision, setDecision] = useState('')
  const [reasoning, setReasoning] = useState('')
  const [feedback, setFeedback] = useState<ScenarioFeedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [startTime])

  const handleStartScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setDecision('')
    setReasoning('')
    setFeedback(null)
    setError(null)
    setStartTime(Date.now())
    setTimeSpent(0)
  }

  const handleSubmit = async () => {
    if (!decision.trim()) {
      setError('Please provide your decision on how to handle this scenario.')
      return
    }

    if (!reasoning.trim()) {
      setError('Please explain your reasoning.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API delay with mock data
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setFeedback(mockFeedback)
      if (startTime) {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60))
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to evaluate your response right now.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentScenario(null)
    setDecision('')
    setReasoning('')
    setFeedback(null)
    setError(null)
    setStartTime(null)
    setTimeSpent(0)
  }

  const difficultyColors = {
    beginner: 'bg-[hsl(var(--accent-emerald))]/10 text-[hsl(var(--accent-emerald))]',
    intermediate: 'bg-[hsl(var(--accent-amber))]/10 text-[hsl(var(--accent-amber))]',
    advanced: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]',
  }

  if (!currentScenario) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-ink">
            Real-World Scenario Simulator
          </h1>
          <p className="max-w-2xl text-sm text-muted-ink">
            Test your decision-making skills with realistic manufacturing
            scenarios. Each scenario presents a challenging situation you might
            encounter on the shop floor.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockScenarios.map((scenario) => (
            <Card key={scenario.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-ink">
                  {scenario.title}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${difficultyColors[scenario.difficulty]}`}
                >
                  {scenario.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-ink line-clamp-3">
                {scenario.description}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                  Constraints
                </p>
                <ul className="space-y-1">
                  {scenario.constraints.slice(0, 2).map((constraint, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-muted-ink"
                    >
                      <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {scenario.timeLimit && (
                <p className="text-xs text-muted-ink">
                  Recommended time: {scenario.timeLimit} minutes
                </p>
              )}
              <Button
                onClick={() => handleStartScenario(scenario)}
                className="w-full"
              >
                Start scenario
              </Button>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="card space-y-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">
                    {currentScenario.title}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${difficultyColors[currentScenario.difficulty]}`}
                  >
                    {currentScenario.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-ink">
                  {currentScenario.description}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
                disabled={isLoading}
              >
                New scenario
              </button>
            </div>
          </header>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-ink">
              <span>Constraints</span>
              {currentScenario.timeLimit && (
                <span>
                  Time limit: {currentScenario.timeLimit} min • Elapsed:{' '}
                  {timeSpent} min
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {currentScenario.constraints.map((constraint, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-ink"
                >
                  <span className="text-[hsl(var(--spark))] mt-0.5">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </div>

          {!feedback && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="decision">Your decision</Label>
                <textarea
                  id="decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="Describe what you would do to handle this situation..."
                  className="w-full h-24 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition resize-none"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasoning">Your reasoning</Label>
                <textarea
                  id="reasoning"
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Explain why you chose this approach and what factors you considered..."
                  className="w-full h-32 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition resize-none"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Evaluating...' : 'Submit response'}
              </Button>

              <p className="text-xs text-muted-ink">
                Toolpath Sparks estimate: 15 (~ based on scenario complexity)
              </p>
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          )}

          {feedback && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                      Decision score
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-ink">
                      {feedback.score}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
                      Time spent
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {timeSpent} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="text-lg font-semibold text-ink">Strengths</h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-ink"
                    >
                      <span className="text-[hsl(var(--accent-emerald))] mt-0.5 font-semibold">
                        ✓
                      </span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card space-y-4">
                <h3 className="text-lg font-semibold text-ink">
                  Areas for improvement
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-ink"
                    >
                      <span className="text-[hsl(var(--accent-amber))] mt-0.5 font-semibold">
                        →
                      </span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card space-y-4">
                <h3 className="text-lg font-semibold text-ink">
                  Alternative solutions
                </h3>
                <p className="text-sm text-muted-ink">
                  Other approaches you might consider:
                </p>
                <ul className="space-y-2">
                  {feedback.alternativeSolutions.map((solution, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 rounded-2xl border border-ink/10 bg-white/80 p-3 text-sm text-ink"
                    >
                      <span className="text-[hsl(var(--spark))] mt-0.5 font-semibold">
                        💡
                      </span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card space-y-4">
                <h3 className="text-lg font-semibold text-ink">
                  Time analysis
                </h3>
                <p className="text-sm text-muted-ink">{feedback.timeAnalysis}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <Card className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Your performance
              </h2>
              <p className="text-xs text-muted-ink">
                Decision-making metrics
              </p>
            </div>
            <span className="badge">Mock data</span>
          </header>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-ink mb-1">
                <span>Average score</span>
                <span>82/100</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--spark))]"
                  style={{ width: '82%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-ink mb-1">
                <span>Average response time</span>
                <span>9.5 min</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--accent-emerald))]"
                  style={{ width: '63%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-ink mb-1">
                <span>Scenarios completed</span>
                <span>12</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Recent scenarios
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
                id: 'scen-101',
                title: 'Production Crisis',
                score: 85,
                timeSpent: 8,
                createdAt: 'Today • 16:30',
                sparkCost: 15,
              },
              {
                id: 'scen-099',
                title: 'Material Shortage',
                score: 92,
                timeSpent: 6,
                createdAt: 'Yesterday • 11:20',
                sparkCost: 15,
              },
              {
                id: 'scen-095',
                title: 'Quality Issue',
                score: 78,
                timeSpent: 12,
                createdAt: 'Mon • 14:15',
                sparkCost: 15,
              },
            ].map((scenario) => (
              <li
                key={scenario.id}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
                  <span>{scenario.createdAt}</span>
                  <span className="text-[hsl(var(--accent-emerald))]">
                    {scenario.score}/100
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {scenario.title}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-ink">
                  <span>{scenario.timeSpent} min</span>
                  <span>•</span>
                  <span>{scenario.sparkCost} Sparks</span>
                </div>
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

