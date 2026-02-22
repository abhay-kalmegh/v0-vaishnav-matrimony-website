"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Bell, Lock, Eye, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
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
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-primary" />
          Account Settings
        </h3>
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Email Address</Label>
              <Input defaultValue="rajesh.das@email.com" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Mobile Number</Label>
              <Input defaultValue="+91 98765 12345" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </h3>
        <div className="flex flex-col gap-4">
          {[
            { label: "New interest received", desc: "Get notified when someone sends you an interest", default: true },
            { label: "Interest accepted", desc: "Get notified when your interest is accepted", default: true },
            { label: "New messages", desc: "Get notified for new chat messages", default: true },
            { label: "Profile views", desc: "Get notified when someone views your profile", default: false },
            { label: "New match suggestions", desc: "Get notified about new compatible profiles", default: true },
            { label: "Event reminders", desc: "Get reminders about upcoming community events", default: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
          <Eye className="h-5 w-5 text-primary" />
          Privacy Settings
        </h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Who can see your photos?</Label>
            <Select defaultValue="accepted">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">All Members</SelectItem>
                <SelectItem value="accepted">Accepted Interests Only</SelectItem>
                <SelectItem value="none">Nobody (Hidden)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Who can see your contact details?</Label>
            <Select defaultValue="accepted">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accepted">Accepted Interests Only</SelectItem>
                <SelectItem value="none">Nobody</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Profile visibility</p>
              <p className="text-xs text-muted-foreground">Make your profile visible in search results</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Show online status</p>
              <p className="text-xs text-muted-foreground">Let others know when you are online</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
          <Trash2 className="h-5 w-5 text-destructive" />
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, all your data will be permanently removed. This action
          cannot be undone.
        </p>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Delete Account
        </Button>
      </div>
    </div>
  )
}
