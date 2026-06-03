'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import matchesAPI from '@/lib/api/matches'
import interestsAPI from '@/lib/api/interests'
import { Heart, MapPin, Sparkles, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function SuggestionsContent() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await matchesAPI.getMatchSuggestions()
        setSuggestions(data)
      } catch (error) {
        console.error('[v0] Error fetching suggestions:', error)
        toast.error('Failed to load suggestions')
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [])

  const handleSendInterest = async (profileId: string) => {
    try {
      await interestsAPI.sendInterest(profileId)
      toast.success('Interest sent!')
      moveToNext()
    } catch (error) {
      console.error('[v0] Error sending interest:', error)
      toast.error('Failed to send interest')
    }
  }

  const handlePass = () => {
    moveToNext()
  }

  const moveToNext = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      toast.info('No more suggestions available')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading suggestions...</div>
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No match suggestions available</p>
        <p className="text-sm text-muted-foreground">
          Complete your profile to get better matches
        </p>
      </div>
    )
  }

  const current = suggestions[currentIndex]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">Match Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} of {suggestions.length}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Image */}
        <div className="relative h-96 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
          {current.photos && current.photos.length > 0 && (
            <Image
              src={current.photos[0].photo}
              alt={current.user.first_name}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-6 border-t border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {current.user.first_name}, {current.age}
              </h1>
              <p className="flex items-center gap-1.5 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                {current.location}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {current.compatibility || Math.round(Math.random() * 30 + 70)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Match</p>
            </div>
          </div>

          {current.bio && (
            <p className="text-foreground mb-4 leading-relaxed">{current.bio}</p>
          )}

          <div className="grid gap-2 text-sm mb-6">
            {current.education && (
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{current.education.degree}</span>
              </div>
            )}
            {current.career && (
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">
                  {current.career.occupation} at {current.career.company}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handlePass}
            >
              <X className="h-5 w-5" />
              Skip
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={() => handleSendInterest(current.id)}
            >
              <Heart className="h-5 w-5" />
              Send Interest
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full mt-3"
            asChild
          >
            <Link href={`/dashboard/profile/${current.id}`}>
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {suggestions.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-border w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
