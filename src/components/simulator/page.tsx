import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SimulatorPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">CNC Simulator</h1>
        <p className="text-muted-ink">
          Visualize toolpaths and test your G-code before running on actual machines
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="space-y-4">
          <div className="aspect-video bg-surface-strong rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-ink">3D Backplot Viewer</p>
              <p className="text-xs text-muted-ink">
                Placeholder for toolpath visualization
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">G-Code Input</h3>
            <textarea
              className="w-full h-32 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2 text-sm font-mono text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20"
              placeholder="Paste your G-code here..."
            />
            <div className="flex gap-2">
              <Button size="sm">Load File</Button>
              <Button size="sm" variant="secondary">
                Clear
              </Button>
              <Button size="sm" className="ml-auto">
                Run Simulation
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <h3 className="font-semibold text-ink">Simulation Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-ink">Speed</span>
                <span className="text-sm text-ink">100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="100"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                Play
              </Button>
              <Button variant="secondary" className="w-full" size="sm">
                Pause
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Reset
              </Button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-semibold text-ink">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-ink">Cycle Time</span>
                <span className="text-ink">--:--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Tool Changes</span>
                <span className="text-ink">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Rapid Moves</span>
                <span className="text-ink">--</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

