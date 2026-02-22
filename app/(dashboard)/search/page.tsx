"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  Heart,
  MapPin,
  Sparkles,
  BookOpen,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const profiles = [
  {
    id: "1",
    name: "Lakshmi Devi",
    age: 26,
    height: "5'4\"",
    location: "Ahmedabad, Gujarat",
    sampraday: "Pushtimarg",
    occupation: "Software Engineer",
    education: "B.Tech, Computer Science",
    compatibility: 94,
    image: "/images/couple-1.jpg",
    practices: "16 rounds daily",
    diet: "Sattvic, Prasad-only",
    initiated: true,
  },
  {
    id: "2",
    name: "Radha Sharma",
    age: 24,
    height: "5'2\"",
    location: "Vrindavan, UP",
    sampraday: "ISKCON",
    occupation: "Temple Seva",
    education: "M.A., Sanskrit",
    compatibility: 91,
    image: "/images/couple-2.jpg",
    practices: "12 rounds daily",
    diet: "Sattvic, Prasad-only",
    initiated: true,
  },
  {
    id: "3",
    name: "Meera Patel",
    age: 27,
    height: "5'5\"",
    location: "Mumbai, Maharashtra",
    sampraday: "Gaudiya Vaishnav",
    occupation: "Doctor",
    education: "MBBS, MD",
    compatibility: 88,
    image: "/images/couple-3.jpg",
    practices: "8 rounds daily",
    diet: "Vegetarian",
    initiated: false,
  },
  {
    id: "4",
    name: "Govindi Devi",
    age: 25,
    height: "5'3\"",
    location: "Surat, Gujarat",
    sampraday: "Pushtimarg",
    occupation: "Teacher",
    education: "M.Ed.",
    compatibility: 85,
    image: "/images/hero-temple.jpg",
    practices: "Performs daily puja",
    diet: "Sattvic",
    initiated: true,
  },
  {
    id: "5",
    name: "Rukmini Das",
    age: 23,
    height: "5'6\"",
    location: "Delhi",
    sampraday: "ISKCON",
    occupation: "CA",
    education: "B.Com, CA",
    compatibility: 82,
    image: "/images/couple-1.jpg",
    practices: "16 rounds daily",
    diet: "Prasad-only",
    initiated: true,
  },
  {
    id: "6",
    name: "Yamuna Devi",
    age: 28,
    height: "5'4\"",
    location: "Pune, Maharashtra",
    sampraday: "Vallabh Sampraday",
    occupation: "Business Owner",
    education: "MBA",
    compatibility: 79,
    image: "/images/couple-2.jpg",
    practices: "Ekadashi fasting",
    diet: "Vegetarian, no onion/garlic",
    initiated: false,
  },
]

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6">
      {/* Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or Sampraday..."
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 border-border text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {showFilters && <X className="h-3 w-3 ml-1" />}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Sampraday</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Sampraday</SelectItem>
                  <SelectItem value="pushtimarg">Pushtimarg</SelectItem>
                  <SelectItem value="iskcon">ISKCON</SelectItem>
                  <SelectItem value="gaudiya">Gaudiya Vaishnav</SelectItem>
                  <SelectItem value="vallabh">Vallabh Sampraday</SelectItem>
                  <SelectItem value="ramanandi">Ramanandi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Age Range</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" className="w-full" />
                <span className="text-muted-foreground text-xs">to</span>
                <Input type="number" placeholder="Max" className="w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input placeholder="City or State" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Diet</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="sattvic">Sattvic (No onion/garlic)</SelectItem>
                  <SelectItem value="prasad">Prasad-only</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Initiated (Diksha)</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Education</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="bachelors">{"Bachelor's & above"}</SelectItem>
                  <SelectItem value="masters">{"Master's & above"}</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Marital Status</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="never-married">Never Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{profiles.length}</span> profiles
        </p>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by: Best Match" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compatibility">Best Match</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="age-asc">Age: Low to High</SelectItem>
            <SelectItem value="age-desc">Age: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />

              {/* Compatibility Badge */}
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 rounded-full bg-card/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {profile.compatibility}% Match
                </span>
              </div>

              {/* Name overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-serif text-lg font-semibold text-card">
                  {profile.name}, {profile.age}
                </h3>
                <p className="flex items-center gap-1 text-xs text-card/80">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {profile.sampraday}
                </span>
                {profile.initiated && (
                  <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    Initiated
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.education}
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                  {profile.practices}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  <Heart className="mr-1.5 h-3.5 w-3.5" />
                  Send Interest
                </Button>
                <Link href={`/profile/${profile.id}`} className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border text-foreground text-xs"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
