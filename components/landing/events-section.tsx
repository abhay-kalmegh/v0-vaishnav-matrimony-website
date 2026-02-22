import { Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const events = [
  {
    title: "Janmashtami Special Satsang & Meet",
    date: "Aug 26, 2026",
    time: "6:00 PM - 9:00 PM",
    location: "ISKCON Temple, Mumbai",
    type: "Satsang",
    description:
      "Join fellow devotees for an evening of kirtan, prasadam, and community matchmaking during the auspicious Janmashtami celebrations.",
  },
  {
    title: "Vaishnav Families Meet-Up",
    date: "Sep 14, 2026",
    time: "10:00 AM - 2:00 PM",
    location: "Shrinathji Temple Hall, Nathdwara",
    type: "Meetup",
    description:
      "A family-oriented gathering for Pushtimarg devotees to meet prospective matches in a traditional and respectful setting.",
  },
  {
    title: "Online Spiritual Compatibility Workshop",
    date: "Oct 5, 2026",
    time: "7:00 PM - 8:30 PM",
    location: "Online (Zoom)",
    type: "Workshop",
    description:
      "Learn about the importance of spiritual alignment in marriage. Expert speakers discuss Vaishnav values in modern relationships.",
  },
]

export function EventsSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Upcoming Events
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Satsang, Meet-Ups & Community Events
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Attend spiritual gatherings and community events designed to help devotee families
            connect in person.
          </p>
        </div>

        {/* Events List */}
        <div className="mt-14 flex flex-col gap-6">
          {events.map((event) => (
            <div
              key={event.title}
              className="group flex flex-col gap-6 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                {/* Date Badge */}
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold leading-none">
                    {event.date.split(" ")[1].replace(",", "")}
                  </span>
                  <span className="text-xs font-medium uppercase">
                    {event.date.split(" ")[0]}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {event.title}
                  </h3>
                  <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
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
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Register
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
