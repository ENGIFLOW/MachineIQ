const readinessMetrics = [
  { label: 'Toolpath confidence', value: 88 },
  { label: 'Spindle safety checks', value: 72 },
  { label: 'Instructor feedback loops', value: 94 },
]

export function HeroSection() {
  return (
    <section className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-7">
        <span className="badge">AI-powered CNC mastery</span>
        <h1 className="text-balance text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
          Train the next generation of CNC talent with MachineIQ.
        </h1>
        <p className="max-w-xl text-lg text-muted-ink">
          Give students, instructors, and operations leaders a shared digital
          workshop. MachineIQ blends adaptive CNC lesson plans, machine
          simulators, and AI coaching to accelerate certification readiness.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/auth/sign-up" className="btn-primary">
            Get started free
          </a>
          <a href="#pricing" className="btn-secondary">
            Talk to our team
          </a>
        </div>
        <ul className="grid gap-3 text-sm text-muted-ink">
          <li className="feature-bullet">
            Standards-aligned curriculum mapped to NIMS pathways.
          </li>
          <li className="feature-bullet">
            AI workbench converts G-code into toolpath visualizations and safety
            insights.
          </li>
          <li className="feature-bullet">
            Institutional dashboards track cohort progress and usage.
          </li>
        </ul>
      </div>
      <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-surface to-white p-8 shadow-lg shadow-spark/10">
        <div className="mb-6 flex items-center justify-between text-sm font-medium text-muted-ink">
          <span>Machine readiness</span>
          <span className="text-[hsl(var(--spark))]">Live preview</span>
        </div>
        <div className="space-y-5">
          {readinessMetrics.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-ink">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--spark))]"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-white/40 bg-white/70 p-4 backdrop-blur">
          <div className="mb-3 h-40 rounded-2xl border border-dashed border-ink/10 bg-surface/60" role="img" aria-label="Placeholder CNC simulator screenshot" />
          <h3 className="text-sm font-semibold text-ink">Sparks in action</h3>
          <p className="mt-2 text-sm text-muted-ink">
            Students spend Sparks to run simulations, receive AI critiques, and
            request instructor reviews—keeping cost predictable for your
            program.
          </p>
        </div>
      </div>
    </section>
  )
}


