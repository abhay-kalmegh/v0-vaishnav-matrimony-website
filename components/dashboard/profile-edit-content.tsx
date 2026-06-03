'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import profileAPI from '@/lib/api/profiles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Save, User, BookOpen, Briefcase, Heart, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileEditContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return
        const data = await profileAPI.getMyProfile()
        setProfile(data)
        setFormData({
          bio: data.bio || '',
          height: data.height || '',
          weight: data.weight || '',
          education: data.education?.degree || '',
          occupation: data.career?.occupation || '',
          company: data.career?.company || '',
          income_range: data.career?.income_range || '',
          family_type: data.family?.family_type || '',
        })
      } catch (error) {
        console.error('[v0] Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (!user?.id) throw new Error('User not found')

      // Update profile
      await profileAPI.updateProfile({
        bio: formData.bio,
        height: formData.height,
        weight: formData.weight,
      })

      // Update education if changed
      if (formData.education) {
        await profileAPI.updateEducation({
          degree: formData.education,
        })
      }

      // Update career if changed
      if (formData.occupation) {
        await profileAPI.updateCareer({
          occupation: formData.occupation,
          company: formData.company,
          income_range: formData.income_range,
        })
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('[v0] Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your details to improve match accuracy
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Career</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Family</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="bio">About Me</Label>
                <textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full mt-2 p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={'e.g., 5\'6"'}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 55"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="education">Degree</Label>
                <Input
                  id="education"
                  value={formData.education || ''}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="e.g., B.Tech, Computer Science"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="career" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation || ''}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="mt-2"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., TCS"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="income">Annual Income</Label>
                  <Select value={formData.income_range || ''} onValueChange={(value) => handleInputChange('income_range', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0-5 Lakhs</SelectItem>
                      <SelectItem value="5-10">5-10 Lakhs</SelectItem>
                      <SelectItem value="10-20">10-20 Lakhs</SelectItem>
                      <SelectItem value="20-30">20-30 Lakhs</SelectItem>
                      <SelectItem value="30+">30+ Lakhs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="familyType">Family Type</Label>
                <Select value={formData.family_type || ''} onValueChange={(value) => handleInputChange('family_type', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select family type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joint">Joint Family</SelectItem>
                    <SelectItem value="nuclear">Nuclear Family</SelectItem>
                    <SelectItem value="extended">Extended Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
