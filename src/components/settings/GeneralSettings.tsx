'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export function GeneralSettings() {
  const [fullName, setFullName] = useState('jacob')
  const [displayName, setDisplayName] = useState('jacob')
  const [workDescription, setWorkDescription] = useState('Engineering')
  const [preferences, setPreferences] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">General</h1>

      {/* User Information */}
      <Card className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-surface-strong flex items-center justify-center text-lg font-semibold text-ink">
            J
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">What should AI call you?</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workDescription">What best describes your work?</Label>
              <select
                id="workDescription"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="flex w-full rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition"
              >
                <option value="Engineering">Engineering</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ink">
            What personal preferences should AI consider in responses?
          </h3>
          <p className="text-sm text-muted-ink">
            Your preferences will apply to all conversations. Learn about preferences
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferences">Preferences</Label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. I primarily work with 3-axis mills and prefer detailed explanations..."
            className="w-full h-24 rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted-ink focus:border-[hsl(var(--spark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--spark))]/20 transition resize-none"
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card className="space-y-6 p-6">
        <h3 className="text-lg font-semibold text-ink">Notifications</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">Response completions</p>
            <p className="text-sm text-muted-ink">
              Get notified when AI has finished a response. Most useful for long-running tasks like tool calls and simulations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? 'bg-[hsl(var(--spark))]' : 'bg-surface-strong'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink">Email notifications</p>
            <p className="text-sm text-muted-ink">
              Get an email when AI workbench tasks have completed or need your response.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailNotifications ? 'bg-[hsl(var(--spark))]' : 'bg-surface-strong'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  )
}

