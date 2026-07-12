import { ProtectedRoute } from '@/lib/components/protected-route'
import { EventsContent } from '@/components/dashboard/events-content'

export const dynamic = 'force-dynamic'

export default function DashboardEventsPage() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  )
}
