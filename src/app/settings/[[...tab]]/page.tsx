import { AppShell } from '@/components/layout/AppShell'
import SettingsPage from '@/components/settings/page'

export default async function SettingsRoute({
  params,
}: {
  params: Promise<{ tab?: string[] }>
}) {
  const resolvedParams = await params
  const activeTab = resolvedParams.tab?.[0] || 'general'
  return (
    <AppShell>
      <SettingsPage activeTab={activeTab} />
    </AppShell>
  )
}

