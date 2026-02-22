"use client"

import { Calendar, MapPin, Clock, Users, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const upcomingEvents = [
  {
    title: "Janmashtami Special Satsang & Meet",
    date: "Aug 26, 2026",
    time: "6:00 PM - 9:00 PM",
    location: "ISKCON Temple, Mumbai",
    type: "Satsang",
    attendees: 156,
    description:
      "Join fellow devotees for an evening of kirtan, prasadam, and community matchmaking during the auspicious Janmashtami celebrations.",
    registered: false,
  },
  {
    title: "Vaishnav Families Meet-Up",
    date: "Sep 14, 2026",
    time: "10:00 AM - 2:00 PM",
    location: "Shrinathji Temple Hall, Nathdwara",
    type: "Meetup",
    attendees: 89,
    description:
      "A family-oriented gathering for Pushtimarg devotees to meet prospective matches in a traditional and respectful setting.",
    registered: true,
  },
  {
    title: "Online Spiritual Compatibility Workshop",
    date: "Oct 5, 2026",
    time: "7:00 PM - 8:30 PM",
    location: "Online (Zoom)",
    type: "Workshop",
    attendees: 234,
    description:
      "Learn about the importance of spiritual alignment in marriage. Expert speakers discuss Vaishnav values in modern relationships.",
    registered: false,
  },
]

const pastEvents = [
  {
    title: "Radha Ashtami Special Gathering",
    date: "Sep 1, 2025",
    time: "5:00 PM - 8:00 PM",
    location: "Vrindavan Dham",
    type: "Satsang",
    attendees: 200,
    description: "A beautiful evening celebrating the appearance of Srimati Radharani with devotees from across India.",
    registered: true,
  },
]

export default function DashboardEventsPage() {
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Community Events</h2>
        <p className="text-sm text-muted-foreground">
          Attend spiritual gatherings and meet devotee families in person
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="flex flex-col gap-5">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-lg font-bold leading-none">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                      <span className="text-[10px] font-medium uppercase">
                        {event.date.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          {event.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {event.type}
                        </Badge>
                        {event.registered && (
                          <Badge className="bg-primary/10 text-primary text-xs border-0">
                            Registered
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {event.registered ? (
                      <Button variant="outline" className="border-border text-foreground gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </Button>
                    ) : (
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                        <Calendar className="h-4 w-4" />
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="flex flex-col gap-5">
            {pastEvents.map((event) => (
              <div
                key={event.title}
                className="rounded-xl border border-border bg-card p-6 opacity-80"
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <span className="text-lg font-bold leading-none">
                      {event.date.split(" ")[1].replace(",", "")}
                    </span>
                    <span className="text-[10px] font-medium uppercase">
                      {event.date.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.attendees} attended
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
