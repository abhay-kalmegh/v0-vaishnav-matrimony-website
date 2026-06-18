"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, X, Check, Clock, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const receivedInterests = [
  { name: "Meera Patel", age: 27, location: "Mumbai", sampraday: "Gaudiya Vaishnav", compatibility: 88, image: "/images/couple-2.jpg", time: "2 hours ago" },
  { name: "Yamuna Devi", age: 25, location: "Pune", sampraday: "ISKCON", compatibility: 82, image: "/images/couple-3.jpg", time: "1 day ago" },
  { name: "Govindi Das", age: 24, location: "Surat", sampraday: "Pushtimarg", compatibility: 79, image: "/images/couple-1.jpg", time: "3 days ago" },
]

const sentInterests = [
  { name: "Lakshmi Devi", age: 26, location: "Ahmedabad", sampraday: "Pushtimarg", compatibility: 94, image: "/images/couple-1.jpg", status: "Pending", time: "1 day ago" },
  { name: "Radha Sharma", age: 24, location: "Vrindavan", sampraday: "ISKCON", compatibility: 91, image: "/images/couple-2.jpg", status: "Accepted", time: "3 days ago" },
]

const acceptedInterests = [
  { name: "Radha Sharma", age: 24, location: "Vrindavan", sampraday: "ISKCON", compatibility: 91, image: "/images/couple-2.jpg", time: "3 days ago" },
  { name: "Rukmini Ji", age: 23, location: "Delhi", sampraday: "ISKCON", compatibility: 85, image: "/images/couple-3.jpg", time: "1 week ago" },
]

function InterestCard({
  interest,
  type,
}: {
  interest: (typeof receivedInterests)[0] & { status?: string }
  type: "received" | "sent" | "accepted"
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={interest.image} alt={interest.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-serif font-semibold text-foreground truncate">
            {interest.name}, {interest.age}
          </h3>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Sparkles className="h-2.5 w-2.5" />
            {interest.compatibility}%
          </span>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="h-3 w-3" />
          {interest.location} &middot; {interest.sampraday}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          {interest.time}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {type === "received" && (
          <>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9">
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button size="sm" variant="outline" className="border-border text-muted-foreground h-9">
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        {type === "sent" && interest.status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              interest.status === "Accepted"
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {interest.status}
          </span>
        )}
        {type === "accepted" && (
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9">
            Start Chat
          </Button>
        )}
      </div>
    </div>
  )
}

export default function InterestsPage() {
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <Tabs defaultValue="received">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received" className="gap-1.5">
            <Heart className="h-4 w-4" />
            Received ({receivedInterests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            Sent ({sentInterests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-1.5">
            <Check className="h-4 w-4" />
            Accepted ({acceptedInterests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <div className="flex flex-col gap-3">
            {receivedInterests.map((interest) => (
              <InterestCard key={interest.name} interest={interest} type="received" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <div className="flex flex-col gap-3">
            {sentInterests.map((interest) => (
              <InterestCard key={interest.name} interest={interest} type="sent" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          <div className="flex flex-col gap-3">
            {acceptedInterests.map((interest) => (
              <InterestCard key={interest.name} interest={interest} type="accepted" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
