import { ProtectedRoute } from '@/lib/components/protected-route';
import { InterestsContent } from '@/components/dashboard/interests-content';

export default function InterestsPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <InterestsContent />
    </ProtectedRoute>
  );
}
