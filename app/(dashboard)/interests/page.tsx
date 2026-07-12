import { ProtectedRoute } from '@/lib/components/protected-route';
import { InterestsContent } from '@/components/dashboard/interests-content';

export const dynamic = 'force-dynamic'

export default function InterestsPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <InterestsContent />
    </ProtectedRoute>
  );
}
