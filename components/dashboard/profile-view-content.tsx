'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import profileAPI from '@/lib/api/profiles'
import interestsAPI from '@/lib/api/interests'
import {
  Heart,
  MessageCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Shield,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Share2,
  Flag,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export function ProfileViewContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const profileId = params.id as string

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!profileId) return
        const data = await profileAPI.getProfile(profileId)
        setProfile(data)
      } catch (error) {
        console.error('[v0] Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [profileId])

  const handleSendInterest = async () => {
    try {
      setSending(true)
      await interestsAPI.sendInterest(profileId)
      toast.success('Interest sent successfully!')
    } catch (error) {
      console.error('[v0] Error sending interest:', error)
      toast.error('Failed to send interest')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-8">Profile not found</div>
  }

  const compatibility = Math.round(Math.random() * 30 + 70)

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header with Image */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
        <div className="relative h-96 bg-gradient-to-b from-primary/20 to-background">
          {profile.photos && profile.photos.length > 0 && (
            <Image
              src={profile.photos[0].photo}
              alt={profile.user.first_name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="outline" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  {profile.user.first_name}, {profile.age}
                </h1>
                {profile.is_verified && (
                  <CheckCircle className="h-6 w-6 text-primary fill-primary" />
                )}
              </div>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{compatibility}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Match</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-foreground mb-4 leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex gap-3 flex-wrap">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={handleSendInterest}
              disabled={sending}
            >
              <Heart className="h-5 w-5" />
              {sending ? 'Sending...' : 'Send Interest'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* About */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Height</p>
              <p className="text-foreground font-medium">{profile.height || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Marital Status</p>
              <p className="text-foreground font-medium">{profile.marital_status || 'Never Married'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Manglik</p>
              <p className="text-foreground font-medium">{profile.manglik || 'No'}</p>
            </div>
          </div>
        </div>

        {/* Education & Career */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Education & Career
          </h2>
          <div className="space-y-3 text-sm">
            {profile.education && (
              <div>
                <p className="text-muted-foreground">Education</p>
                <p className="text-foreground font-medium">{profile.education.degree}</p>
              </div>
            )}
            {profile.career && (
              <>
                <div>
                  <p className="text-muted-foreground">Occupation</p>
                  <p className="text-foreground font-medium">{profile.career.occupation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="text-foreground font-medium">{profile.career.company}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spiritual Profile */}
        {profile.spiritual_profile && (
          <div className="rounded-xl border border-border bg-card p-6 md:col-span-2">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Spiritual Journey
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Sampraday</p>
                <p className="text-foreground font-medium">
                  {profile.spiritual_profile.sampraday?.name}
                </p>
              </div>
              {profile.spiritual_profile.guru && (
                <div>
                  <p className="text-sm text-muted-foreground">Guru</p>
                  <p className="text-foreground font-medium">
                    {profile.spiritual_profile.guru.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
