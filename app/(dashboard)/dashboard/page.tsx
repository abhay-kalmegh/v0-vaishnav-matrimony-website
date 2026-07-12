import { ProtectedRoute } from '@/lib/components/protected-route';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <DashboardContent />
    </ProtectedRoute>
  );
}
