import Link from 'next/link'
import { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  user?: {
    email?: string
    fullName?: string
  }
}

const mainNav = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lessons', label: 'Lessons' },
  { href: '/workbench', label: 'Workbench' },
  { href: '/simulator', label: 'Simulator' },
]

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:py-16">
        {children}
      </main>
      <footer className="border-t border-ink/10 bg-white/70 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-ink sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Toolpath Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

