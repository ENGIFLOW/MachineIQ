'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const features = [
  'Access to all CNC courses (Mill, Lathe, 3D Milling, Multi-Axis)',
  'Progress tracking and course completion certificates',
  'Learn at your own pace with lifetime access',
  'Cancel anytime',
]

export function PricingSection() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const pricingHref = user ? '/payment' : '/auth/sign-up'

  return (
    <section className="space-y-8" id="pricing">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-ink">Simple Pricing</h2>
        <p className="text-muted-ink">
          One price, unlimited access to all courses
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <span className="badge">Monthly Subscription</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-ink">$99</span>
              <span className="text-muted-ink">/month</span>
            </div>
            <p className="text-sm text-muted-ink">Per seat subscription</p>
          </div>
          <ul className="space-y-3 text-sm text-muted-ink">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-[hsl(var(--spark))] mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link href={pricingHref} className="block mt-6">
            <Button className="w-full" size="lg">
              {user ? 'Subscribe Now' : 'Get Started'}
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-ink">
            Secure payment powered by Stripe. Your subscription will auto-renew monthly.
          </p>
        </Card>
      </div>
    </section>
  )
}

