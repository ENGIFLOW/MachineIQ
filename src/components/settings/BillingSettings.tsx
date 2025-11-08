'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const mockInvoices = [
  { date: 'Nov 5, 2025', total: '$69.00', status: 'Paid' },
  { date: 'Oct 5, 2025', total: '$69.00', status: 'Paid' },
  { date: 'Sep 5, 2025', total: '$69.00', status: 'Paid' },
  { date: 'Aug 5, 2025', total: '$69.00', status: 'Paid' },
]

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Billing</h1>

      <Card className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--spark))]/10">
            <svg className="h-6 w-6 text-[hsl(var(--spark))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ink">Premium Institutional plan</h3>
            <p className="text-sm text-muted-ink">Monthly</p>
            <p className="mt-2 text-sm text-muted-ink">
              Your subscription will auto renew on Dec 6, 2025.
            </p>
          </div>
          <Button variant="outline">Adjust plan</Button>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Payment</h3>
            <p className="text-sm text-muted-ink">link Link by Stripe</p>
          </div>
          <Button variant="outline">Update</Button>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-ink">Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-ink">Date</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-ink">Total</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-ink">Status</th>
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-ink">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {mockInvoices.map((invoice, index) => (
                <tr key={index}>
                  <td className="py-3 text-sm text-ink">{invoice.date}</td>
                  <td className="py-3 text-sm text-ink">
                    {invoice.total}
                    <button className="ml-2 text-muted-ink hover:text-ink" title="Invoice details">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                  <td className="py-3 text-sm text-ink">{invoice.status}</td>
                  <td className="py-3">
                    <a href="#" className="text-sm text-ink underline hover:text-[hsl(var(--spark))]">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

