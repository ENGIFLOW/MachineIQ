import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-semibold text-ink">
                Toolpath Academy
              </h1>
            </Link>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-ink">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-[hsl(var(--spark))] to-[hsl(var(--accent-emerald))]">
        <div className="max-w-md space-y-6 text-white">
          <h3 className="text-3xl font-semibold">
            Master CNC programming with AI
          </h3>
          <p className="text-white/90">
            Join students and instructors using Toolpath Academy to accelerate
            certification readiness through adaptive learning and real-time AI
            coaching.
          </p>
          <ul className="space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              AI-powered G-code review and optimization
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              Personalized learning paths based on skill gaps
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              Real-world scenario simulations
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

