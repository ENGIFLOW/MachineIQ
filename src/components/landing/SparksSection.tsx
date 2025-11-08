const highlights = [
  'Base allotment: 1,200 Sparks per student each month.',
  'Bonus stash: instructors earn pooled Sparks for deep-dive reviews.',
  'Auto-alerts fire when any cohort hits 75% consumption.',
]

const pricingBullets = [
  'Flexible seat management and billing options.',
  'Secure authentication, role-based access, and content delivery.',
  'Dedicated onboarding support and quarterly curriculum reviews.',
]

export function SparksSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]" id="sparks">
      <div className="card space-y-4">
        <h2 className="text-2xl font-semibold text-ink">
          Toolpath Sparks: our AI usage currency
        </h2>
        <p className="text-sm text-muted-ink">
          Every AI interaction—from G-code critique to mentor chat—draws from an
          allocation of Toolpath Sparks. Institutions assign monthly Sparks per
          seat and top up as needed. Rollover buffers cover busy production weeks
          without surprise overages.
        </p>
        <ul className="grid gap-3 text-sm text-muted-ink">
          {highlights.map((item) => (
            <li key={item} className="feature-bullet">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="card" id="pricing">
        <span className="badge mb-4 w-fit">Premium institutional plan</span>
        <h2 className="text-3xl font-semibold text-ink">$69 per seat / month</h2>
        <p className="mt-3 text-sm text-muted-ink">
          Includes 1,200 Sparks, unlimited lesson authoring, and Mux-hosted
          simulator streaming. Volume pricing unlocks at 100+ seats.
        </p>
        <div className="mt-6 space-y-3 text-sm text-muted-ink">
          {pricingBullets.map((item) => (
            <p key={item} className="feature-bullet">
              {item}
            </p>
          ))}
        </div>
        <a
          href="/contact"
          className="btn-primary mt-8 inline-flex w-full justify-center"
        >
          Schedule institutional walkthrough
        </a>
      </div>
    </section>
  )
}


