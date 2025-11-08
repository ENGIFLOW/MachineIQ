const pillars = [
  {
    title: 'Learner Studio',
    body:
      'Adaptive lesson tracks, competency-based assessments, and instant feedback so students stay confident at the machine.',
  },
  {
    title: 'Instructor Toolkit',
    body:
      'Auto-generate lab plans, annotate toolpaths, and monitor student submissions from a unified teaching console.',
  },
  {
    title: 'Operations Command',
    body:
      'Admin dashboards surface certification velocity, Spark usage, and safety intervention trends for leadership.',
  },
]

export function PillarsSection() {
  return (
    <section className="grid gap-8 lg:grid-cols-3">
      {pillars.map((card) => (
        <article key={card.title} className="card space-y-3">
          <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
          <p className="text-sm text-muted-ink">{card.body}</p>
        </article>
      ))}
    </section>
  )
}


