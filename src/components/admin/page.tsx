import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="text-muted-ink">
          Manage subscriptions, usage, and institutional settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-4">
          <h3 className="font-semibold text-ink">Subscription</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-ink">Plan</span>
              <span className="text-ink">Premium Institutional</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">Seats</span>
              <span className="text-ink">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">Next Billing</span>
              <span className="text-ink">--</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm">
            Manage Subscription
          </Button>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ink">Sparks</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-ink">Total Allocated</span>
              <span className="text-ink">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">Used</span>
              <span className="text-ink">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">Remaining</span>
              <span className="text-ink">--</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm">
            Purchase More
          </Button>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ink">Usage Analytics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-ink">Active Users</span>
              <span className="text-ink">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">Lessons Completed</span>
              <span className="text-ink">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-ink">AI Interactions</span>
              <span className="text-ink">--</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm">
            View Reports
          </Button>
        </Card>
      </div>
    </div>
  )
}

