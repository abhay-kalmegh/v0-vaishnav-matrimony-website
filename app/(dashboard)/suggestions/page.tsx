"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Sparkles, BookOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const suggestions = [
  {
    id: "1",
    name: "Lakshmi Devi",
    age: 26,
    location: "Ahmedabad, Gujarat",
    sampraday: "Pushtimarg",
    compatibility: 94,
    image: "/images/couple-1.jpg",
    practices: "16 rounds daily, Ekadashi fasting",
    education: "B.Tech, Computer Science",
    reason: "Same Sampraday, aligned practices, matching dietary preferences",
  },
  {
    id: "2",
    name: "Radha Sharma",
    age: 24,
    location: "Vrindavan, UP",
    sampraday: "ISKCON",
    compatibility: 91,
    image: "/images/couple-2.jpg",
    practices: "12 rounds daily, Temple seva",
    education: "M.A., Sanskrit",
    reason: "Shared ISKCON community, strong spiritual practices",
  },
  {
    id: "3",
    name: "Meera Patel",
    age: 27,
    location: "Mumbai, Maharashtra",
    sampraday: "Gaudiya Vaishnav",
    compatibility: 88,
    image: "/images/couple-3.jpg",
    practices: "8 rounds daily, Prasad-only diet",
    education: "MBBS, MD",
    reason: "Compatible lifestyle discipline, similar age group and location",
  },
  {
    id: "4",
    name: "Govindi Devi",
    age: 25,
    location: "Surat, Gujarat",
    sampraday: "Pushtimarg",
    compatibility: 85,
    image: "/images/hero-temple.jpg",
    practices: "Performs daily puja, Ekadashi fasting",
    education: "M.Ed.",
    reason: "Strong family values, similar Sampraday background",
  },
]

export default function SuggestionsPage() {
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Match Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          Profiles recommended based on your spiritual alignment and preferences
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {suggestions.map((match) => (
          <div
            key={match.id}
            className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 md:flex-row md:items-center"
          >
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl md:h-32 md:w-32">
              <Image
                src={match.image}
                alt={match.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className="flex items-center gap-1 rounded-full bg-card/90 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-primary shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {match.compatibility}%
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {match.name}, {match.age}
                </h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {match.sampraday}
                </span>
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {match.location}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  {match.education}
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                  {match.practices}
                </span>
              </div>
              <div className="mt-2 rounded-md bg-secondary px-3 py-1.5">
                <p className="text-xs text-secondary-foreground">
                  <span className="font-medium">Why matched:</span> {match.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-2 md:flex-col">
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs md:w-32">
                <Heart className="h-3.5 w-3.5" />
                Send Interest
              </Button>
              <Link href={`/profile/${match.id}`} className="flex-1 md:w-32">
                <Button variant="outline" className="w-full border-border text-foreground text-xs">
                  View Profile
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
