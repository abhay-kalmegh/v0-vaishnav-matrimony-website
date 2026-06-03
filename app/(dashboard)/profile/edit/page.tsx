import { ProtectedRoute } from '@/lib/components/protected-route'
import { ProfileEditContent } from '@/components/dashboard/profile-edit-content'

export default function ProfileEditPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <ProfileEditContent />
    </ProtectedRoute>
  )
}
