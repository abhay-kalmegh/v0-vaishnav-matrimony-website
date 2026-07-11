import { ProtectedRoute } from '@/lib/components/protected-route'
import { ProfileViewContent } from '@/components/dashboard/profile-view-content'

export default function ProfileViewPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <ProfileViewContent />
    </ProtectedRoute>
  )
}
