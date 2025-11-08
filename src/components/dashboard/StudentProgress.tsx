const sampleModules = [
  {
    title: 'Intro to CNC Milling',
    completion: 82,
    sparkUsage: 910,
    target: 1200,
  },
  {
    title: 'G-code Toolpath Mastery',
    completion: 68,
    sparkUsage: 745,
    target: 1200,
  },
  {
    title: 'Lathe Safety Checks',
    completion: 54,
    sparkUsage: 510,
    target: 1200,
  },
]

export function StudentProgress() {
  return (
    <section className="card space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Student Progress</h2>
          <p className="mt-1 text-sm text-muted-ink">
            Snapshot of current certification cohorts. Toolpath Sparks show AI
            usage velocity per module.
          </p>
        </div>
        <span className="badge">Student view</span>
      </header>
      <div className="space-y-5">
        {sampleModules.map((module) => (
          <article key={module.title} className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{module.title}</h3>
              <span className="text-xs font-medium text-muted-ink">
                {module.sparkUsage.toLocaleString()} / {module.target.toLocaleString()} Sparks
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-ink">
                <span>Competency complete</span>
                <span>{module.completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--spark))]"
                  style={{ width: `${module.completion}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}


