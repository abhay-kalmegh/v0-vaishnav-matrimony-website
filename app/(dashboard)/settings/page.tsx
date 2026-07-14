import { ProtectedRoute } from '@/lib/components/protected-route'
import { SettingsContent } from '@/components/dashboard/settings-content'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
