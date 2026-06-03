'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import eventsAPI from '@/lib/api/events'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function EventsContent() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [allEvents, registered] = await Promise.all([
          eventsAPI.listEvents(),
          eventsAPI.getMyEventRegistrations(),
        ])
        setEvents(allEvents)
        setRegisteredEvents(registered)
      } catch (error) {
        console.error('[v0] Error fetching events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleRegister = async (eventId: string) => {
    try {
      await eventsAPI.registerEvent(eventId)
      toast.success('Successfully registered for event!')
      // Refresh events
      const [allEvents, registered] = await Promise.all([
        eventsAPI.listEvents(),
        eventsAPI.getMyEventRegistrations(),
      ])
      setEvents(allEvents)
      setRegisteredEvents(registered)
    } catch (error) {
      console.error('[v0] Error registering for event:', error)
      toast.error('Failed to register for event')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Events & Satsang</h2>
        <p className="text-sm text-muted-foreground">
          Join spiritual events and meet like-minded devotees
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="registered">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    <div className="grid gap-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.start_date).toLocaleDateString()} at{' '}
                        {new Date(event.start_date).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.attendees} attendees
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="text-right mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Spots Left</p>
                      <p className="text-2xl font-bold text-primary">
                        {event.capacity - event.attendees}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRegister(event.id)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {events.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No upcoming events</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="registered" className="mt-6">
          <div className="grid gap-4">
            {registeredEvents.map((registration) => (
              <Card key={registration.id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {registration.event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {registration.event.description}
                    </p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(registration.event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {registration.event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      Registered
                    </div>
                    <Button variant="outline" className="mt-4">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {registeredEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No registered events yet
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
