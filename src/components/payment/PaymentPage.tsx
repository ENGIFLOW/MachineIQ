'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Price IDs for subscriptions
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || ''
const YEARLY_PRICE_ID = 'price_1SnnvfPK1mIOADePXrSme2E2'

type SubscriptionPlan = 'monthly' | 'yearly'

export function PaymentPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push('/auth/sign-in')
        return
      }
      setUser(user)
      setLoading(false)
    })
  }, [router])

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setError(null)

    try {
      if (!user) {
        router.push('/auth/sign-in')
        return
      }

      const priceId = selectedPlan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID

      if (!priceId) {
        throw new Error('Price ID not configured. Please contact support.')
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          priceId: priceId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-ink">Loading...</div>
      </div>
    )
  }

  const plans = {
    monthly: {
      price: 99,
      period: 'month',
      priceId: MONTHLY_PRICE_ID,
      savings: null,
      renewalText: 'monthly',
    },
    yearly: {
      price: 500,
      period: 'year',
      priceId: YEARLY_PRICE_ID,
      savings: 'Save $688/year',
      renewalText: 'annually',
    },
  }

  const selectedPlanData = plans[selectedPlan]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Subscribe to VietMastercam Training</h1>
        <p className="text-muted-ink">
          Get access to all courses and features with a subscription
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Plan Selection Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setSelectedPlan('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPlan === 'monthly'
              ? 'bg-[hsl(var(--spark))] text-white'
              : 'bg-ink/5 text-muted-ink hover:bg-ink/10'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setSelectedPlan('yearly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
            selectedPlan === 'yearly'
              ? 'bg-[hsl(var(--spark))] text-white'
              : 'bg-ink/5 text-muted-ink hover:bg-ink/10'
          }`}
        >
          Yearly
          {selectedPlan === 'yearly' && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save
            </span>
          )}
        </button>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            {selectedPlanData.savings && (
              <div className="inline-block bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded">
                {selectedPlanData.savings}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-ink">
                ${selectedPlanData.price}
              </span>
              <span className="text-muted-ink">/{selectedPlanData.period}</span>
            </div>
            {selectedPlan === 'yearly' && (
              <p className="text-sm text-muted-ink">
                ${(selectedPlanData.price / 12).toFixed(2)}/month billed annually
              </p>
            )}
            <p className="text-sm text-muted-ink">Per seat subscription</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-ink">What's included:</h3>
            <ul className="space-y-2 text-sm text-muted-ink">
              <li className="flex items-start gap-2">
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
                <span>Access to all CNC courses (Mill, Lathe, 3D Milling, Multi-Axis)</span>
              </li>
              <li className="flex items-start gap-2">
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
                <span>Progress tracking and course completion certificates</span>
              </li>
              <li className="flex items-start gap-2">
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
                <span>Cancel anytime</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={checkoutLoading || !selectedPlanData.priceId}
            className="w-full"
            size="lg"
          >
            {checkoutLoading
              ? 'Processing...'
              : selectedPlan === 'monthly'
              ? 'Subscribe for $99/month'
              : 'Subscribe for $500/year'}
          </Button>

          <p className="text-xs text-center text-muted-ink">
            Secure payment powered by Stripe. Your subscription will auto-renew {selectedPlanData.renewalText}.
          </p>
        </div>
      </Card>
    </div>
  )
}

