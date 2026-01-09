'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const mainNav = [
  { href: '/', label: 'Home' },
  { href: '/lessons', label: 'Lessons' },
]

export function UniversalHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4">
        <Link href="/" className="font-semibold text-ink">
          MachineIQ
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
          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/settings"
                    className="text-sm font-medium text-muted-ink hover:text-ink transition"
                  >
                    Settings
                  </Link>
                  <Link href="/payment" className="btn-primary">
                    Get started
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-muted-ink hover:text-ink transition"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
