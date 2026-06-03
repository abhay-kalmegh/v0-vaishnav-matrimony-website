import { ProtectedRoute } from '@/lib/components/protected-route'
import { SuggestionsContent } from '@/components/dashboard/suggestions-content'

export default function SuggestionsPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <SuggestionsContent />
    </ProtectedRoute>
  )
}
