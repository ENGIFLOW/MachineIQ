'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { AccountSettings } from '@/components/settings/AccountSettings'
import { PrivacySettings } from '@/components/settings/PrivacySettings'
import { BillingSettings } from '@/components/settings/BillingSettings'

const settingsNav = [
  { id: 'general', label: 'General', href: '/settings' },
  { id: 'account', label: 'Account', href: '/settings/account' },
  { id: 'privacy', label: 'Privacy', href: '/settings/privacy' },
  { id: 'billing', label: 'Billing', href: '/settings/billing' },
]

export default function SettingsPage({ activeTab }: { activeTab: string }) {
  const pathname = usePathname()
  const currentTab = activeTab || 'general'

  const renderContent = () => {
    switch (currentTab) {
      case 'general':
        return <GeneralSettings />
      case 'account':
        return <AccountSettings />
      case 'privacy':
        return <PrivacySettings />
      case 'billing':
        return <BillingSettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Left Sidebar */}
      <aside className="space-y-1">
        <h2 className="mb-6 text-2xl font-serif text-ink">Settings</h2>
        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.id === 'general' && pathname === '/settings')
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-surface-strong text-ink'
                    : 'text-muted-ink hover:bg-surface-strong hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="min-w-0">{renderContent()}</div>
    </div>
  )
}

