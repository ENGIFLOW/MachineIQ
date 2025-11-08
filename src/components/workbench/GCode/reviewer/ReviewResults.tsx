import type {
  GCodeReviewIssue,
  GCodeReviewResponse,
} from '@/lib/ai/types'

const severityBadgeStyles: Record<
  GCodeReviewIssue['severity'],
  string
> = {
  critical:
    'bg-red-50 text-red-600 border border-red-200',
  warning:
    'bg-amber-50 text-amber-600 border border-amber-200',
  info:
    'bg-blue-50 text-blue-600 border border-blue-200',
}

const categoryLabels: Record<GCodeReviewIssue['category'], string> = {
  safety: 'Safety',
  efficiency: 'Efficiency',
  syntax: 'Syntax',
  quality: 'Quality',
  machine: 'Machine',
}

export function ReviewResults({
  review,
  isLoading,
}: {
  review: GCodeReviewResponse | null
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="card animate-pulse space-y-4">
        <div className="h-5 w-1/3 rounded-full bg-surface-strong" />
        <div className="h-3 w-2/3 rounded-full bg-surface-strong" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-2xl border border-ink/10 bg-white/70 p-4"
            >
              <div className="h-4 w-24 rounded-full bg-surface-strong" />
              <div className="h-3 w-full rounded-full bg-surface-strong" />
              <div className="h-3 w-5/6 rounded-full bg-surface-strong" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-ink">
          Awaiting your CNC program
        </h2>
        <p className="text-sm text-muted-ink">
          Paste a G-code file on the left and the AI workbench will break down
          safety risks, optimization opportunities, and best practices to
          improve cycle time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Review summary
            </h2>
            <p className="text-sm text-muted-ink">
              Confidence {Math.round(review.summary.confidence * 100)}% •
              Estimated Spark cost {review.summary.sparkCostEstimate}
            </p>
          </div>
          {review.summary.cycleTimeDelta && (
            <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-emerald))]">
              {review.summary.cycleTimeDelta} cycle time
            </span>
          )}
        </header>
        <p className="text-sm text-muted-ink">
          {review.summary.overallAssessment}
        </p>
      </div>

      {review.issues.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-ink">
            Issues
          </h3>
          <div className="grid gap-4">
            {review.issues.map((issue) => (
              <article
                key={issue.id}
                className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
                    <span>
                      Line {issue.line}
                      {issue.code ? ` • ${issue.code}` : ''}
                    </span>
                    <span>•</span>
                    <span>{categoryLabels[issue.category]}</span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityBadgeStyles[issue.severity]}`}
                  >
                    {issue.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink">
                  {issue.explanation}
                </p>
                <p className="mt-2 text-sm font-medium text-[hsl(var(--spark))]">
                  Recommendation: {issue.recommendation}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {review.optimizations.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-ink">
            Suggested optimizations
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {review.optimizations.map((opt) => (
              <article
                key={opt.title}
                className="rounded-2xl border border-ink/10 bg-white/80 p-4"
              >
                <h4 className="text-sm font-semibold text-ink">
                  {opt.title}
                </h4>
                <p className="mt-2 text-sm text-muted-ink">
                  {opt.description}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-ink">
                  {opt.estimatedImpact}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


