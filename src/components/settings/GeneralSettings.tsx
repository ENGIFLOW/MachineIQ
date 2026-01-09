'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/lib/actions/profile'

export function GeneralSettings() {
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      const { profile, error } = await getCurrentUserProfile()
      if (profile && !error) {
        setFullName(profile.full_name || '')
        setDisplayName(profile.full_name || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)
    
    const result = await updateCurrentUserProfile({
      full_name: fullName,
    })

    if (result.success) {
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } else {
      setSaveMessage(result.error || 'Failed to update profile')
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-ink">General</h1>
        <Card className="p-6">
          <p className="text-muted-ink">Loading profile...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">General</h1>

      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('success') 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* User Information */}
      <Card className="space-y-6 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-surface-strong flex items-center justify-center text-lg font-semibold text-ink">
            {fullName.charAt(0).toUpperCase() || '?'}
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
              <Label htmlFor="displayName">Display name</Label>
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
                <option value="">Select an option</option>
                <option value="Engineering">Engineering</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-ink/10">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            variant="primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

