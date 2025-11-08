import { AppShell } from '@/components/layout/AppShell'
import SettingsPage from '@/components/settings/page'

export default function SettingsRoute({
  params,
}: {
  params: { tab?: string[] }
}) {
  const activeTab = params.tab?.[0] || 'general'
  return (
    <AppShell>
      <SettingsPage activeTab={activeTab} />
    </AppShell>
  )
}

