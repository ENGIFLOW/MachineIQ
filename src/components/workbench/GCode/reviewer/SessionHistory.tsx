const mockSessions = [
  {
    id: 'sess-101',
    title: 'Aluminum housing roughing',
    createdAt: 'Today • 09:24',
    sparkCost: 10,
    status: 'Optimized',
  },
  {
    id: 'sess-099',
    title: 'Lathe finishing pass',
    createdAt: 'Yesterday • 17:10',
    sparkCost: 8,
    status: 'Needs review',
  },
  {
    id: 'sess-095',
    title: 'Fixture drilling program',
    createdAt: 'Mon • 14:32',
    sparkCost: 12,
    status: 'Published',
  },
]

export function SessionHistory() {
  return (
    <aside className="card space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Recent reviews</h2>
          <p className="text-xs text-muted-ink">
            Toolpath Sparks consumed last 7 days
          </p>
        </div>
        <span className="badge">Mock data</span>
      </header>
      <ul className="space-y-3">
        {mockSessions.map((session) => (
          <li
            key={session.id}
            className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-muted-ink"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-ink">
              <span>{session.createdAt}</span>
              <span>{session.status}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">
              {session.title}
            </p>
            <p className="mt-1 text-xs text-muted-ink">
              Sparks used: {session.sparkCost}
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
  )
}


