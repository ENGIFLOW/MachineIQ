const pendingReviews = [
  {
    id: 'LAB-204',
    title: 'Precision Pocketing Lab',
    submittedBy: 'Avery Chen',
    dueIn: '4h',
  },
  {
    id: 'LAB-185',
    title: 'Turning Center Safety Quiz',
    submittedBy: 'Jordan Patel',
    dueIn: '1d',
  },
]

const contentIdeas = [
  'Generate lesson on multi-axis probing fundamentals.',
  'Import Haas VF-2 post processor notes into curriculum.',
  'Record simulation walkthrough for offset tuning.',
]

export function InstructorContentManager() {
  return (
    <section className="card space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Instructor Console</h2>
          <p className="mt-1 text-sm text-muted-ink">
            Quickly triage AI-flagged submissions, launch new labs, and keep
            cohorts aligned on safety practices.
          </p>
        </div>
        <span className="badge">Instructor view</span>
      </header>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-ink">Awaiting feedback</h3>
        <div className="grid gap-3">
          {pendingReviews.map((review) => (
            <article
              key={review.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-ink">
                  {review.title}
                </p>
                <p className="mt-1 text-xs text-muted-ink">
                  Submitted by {review.submittedBy}
                </p>
              </div>
              <span className="rounded-full bg-[hsl(var(--spark-soft))] px-3 py-1 text-xs font-medium text-[hsl(var(--spark))]">
                Due in {review.dueIn}
              </span>
            </article>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">AI-suggested additions</h3>
        <ul className="grid gap-2 text-sm text-muted-ink">
          {contentIdeas.map((idea) => (
            <li key={idea} className="feature-bullet">
              {idea}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}


