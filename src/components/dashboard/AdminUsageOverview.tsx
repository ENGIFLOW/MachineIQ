const usageStats = [
  {
    label: 'Active seats',
    value: 184,
    delta: '+12',
  },
  {
    label: 'Sparks consumed (30 days)',
    value: '142k',
    delta: '+8%',
  },
  {
    label: 'AI escalations resolved',
    value: 47,
    delta: '-3%',
  },
]

const alerts = [
  {
    title: 'Cohort A reaching 75% Spark threshold',
    status: 'Alert',
  },
  {
    title: 'Stripe invoice pending for Orbis Manufacturing',
    status: 'Billing',
  },
]

export function AdminUsageOverview() {
  return (
    <section className="card space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Admin Operations</h2>
          <p className="mt-1 text-sm text-muted-ink">
            Monitor revenue, Spark consumption, and support signals to keep your
            CNC program efficient.
          </p>
        </div>
        <span className="badge">Admin view</span>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {usageStats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-white/60 bg-white/80 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-ink">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-[hsl(var(--accent-emerald))]">
              {stat.delta} vs last period
            </p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Operational signals</h3>
        <ul className="grid gap-3">
          {alerts.map((alert) => (
            <li
              key={alert.title}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-muted-ink"
            >
              <span>{alert.title}</span>
              <span className="rounded-full bg-[hsl(var(--accent-emerald))]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-emerald))]">
                {alert.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}


