'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Bell, Lock, Eye, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SettingsContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    interestNotifications: true,
    messageNotifications: true,
    profileVisibility: 'all',
    allowMessages: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSelectChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // In a real app, you'd save to backend
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('[v0] Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account and privacy</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates for important events
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Match Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive new match suggestions
                </p>
              </div>
              <Switch
                checked={settings.matchNotifications}
                onCheckedChange={() => handleToggle('matchNotifications')}
              />
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Interest Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone sends you interest
                </p>
              </div>
              <Switch
                checked={settings.interestNotifications}
                onCheckedChange={() => handleToggle('interestNotifications')}
              />
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Message Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive a message
                </p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={() => handleToggle('messageNotifications')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Eye className="h-5 w-5 text-primary" />
          Privacy & Visibility
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="profileVisibility" className="text-base font-medium">
              Profile Visibility
            </Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value) => handleSelectChange('profileVisibility', value)}
            >
              <SelectTrigger className="mt-2" id="profileVisibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visible to All</SelectItem>
                <SelectItem value="premium">Visible to Premium Members</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Allow Messages</p>
                <p className="text-sm text-muted-foreground">
                  Allow other members to send you messages
                </p>
              </div>
              <Switch
                checked={settings.allowMessages}
                onCheckedChange={() => handleToggle('allowMessages')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-primary" />
          Account
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-foreground mb-2">Email</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="font-medium text-foreground mb-3">Change Password</p>
            <div className="space-y-3">
              <Input placeholder="Current Password" type="password" />
              <Input placeholder="New Password" type="password" />
              <Input placeholder="Confirm Password" type="password" />
              <Button variant="outline" className="w-full">
                Update Password
              </Button>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deactivate Account
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
