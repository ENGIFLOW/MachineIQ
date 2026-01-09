'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function HeroSection() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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

  const getStartedHref = user ? '/payment' : '/auth/sign-up'

  return (
    <section className="text-center space-y-6">
      <span className="badge">CNC Training Platform</span>
      <h1 className="text-balance text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
        Master CNC Programming with Expert-Led Courses
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-muted-ink">
        Learn CNC machining from the ground up. Our comprehensive courses cover
        Mill, Lathe, 3D Milling, and Multi-Axis operations with hands-on
        practice and real-world examples.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={getStartedHref} className="btn-primary">
          Get started free
        </Link>
        <Link href="/lessons" className="btn-secondary">
          Browse Courses
        </Link>
      </div>
      <ul className="grid gap-3 text-sm text-muted-ink max-w-xl mx-auto mt-8">
        <li className="feature-bullet">
          Comprehensive curriculum covering all CNC operations
        </li>
        <li className="feature-bullet">
          Progress tracking and course completion certificates
        </li>
        <li className="feature-bullet">
          Learn at your own pace with lifetime access
        </li>
      </ul>
    </section>
  )
}
