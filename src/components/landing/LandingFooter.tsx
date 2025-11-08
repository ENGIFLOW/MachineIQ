import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-ink sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Toolpath Academy. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

