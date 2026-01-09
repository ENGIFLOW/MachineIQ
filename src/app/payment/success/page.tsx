import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-12 sm:py-16">
      <Card className="p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--spark))]/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[hsl(var(--spark))]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-ink">Payment Successful!</h1>
          <p className="text-muted-ink">
            Thank you for subscribing to VietMastercam Training. Your subscription is now active.
          </p>
        </div>
        {params.session_id && (
          <p className="text-xs text-muted-ink">
            Session ID: {params.session_id}
          </p>
        )}
        <Link href="/lessons">
          <Button className="w-full">Start Learning</Button>
        </Link>
      </Card>
    </main>
  )
}
