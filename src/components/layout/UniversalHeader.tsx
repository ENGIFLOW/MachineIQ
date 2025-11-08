import Link from 'next/link'

const mainNav = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lessons', label: 'Lessons' },
  { href: '/workbench', label: 'Workbench' },
  { href: '/simulator', label: 'Simulator' },
]

export function UniversalHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4">
        <Link href="/" className="font-semibold text-ink">
          Toolpath Academy
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-ink">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/settings"
            className="text-sm font-medium text-muted-ink hover:text-ink transition"
          >
            Settings
          </Link>
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-muted-ink hover:text-ink transition"
          >
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

