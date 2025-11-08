import { AdminUsageOverview } from '@/components/dashboard/AdminUsageOverview'
import { InstructorContentManager } from '@/components/dashboard/InstructorContentManager'
import { StudentProgress } from '@/components/dashboard/StudentProgress'

export function DashboardShell() {
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Unified CNC Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-ink">
            Explore how Toolpath Academy personalizes experiences for each role.
            These demo panels surface live signals from the AI workbench, lesson
            creation pipelines, and institutional oversight tools.
          </p>
        </div>
        <span className="rounded-full bg-[hsl(var(--accent-amber))]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-amber))]">
          Demo environment
        </span>
      </header>
      <div className="grid gap-8 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-2">
          <StudentProgress />
        </div>
        <div className="lg:row-span-2">
          <InstructorContentManager />
        </div>
        <div className="lg:col-span-2">
          <AdminUsageOverview />
        </div>
      </div>
    </div>
  )
}


