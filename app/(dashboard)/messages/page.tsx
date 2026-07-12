import { ProtectedRoute } from '@/lib/components/protected-route';
import { MessagingContent } from '@/components/dashboard/messaging-content';

export const dynamic = 'force-dynamic'

export default function MessagesPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <MessagingContent />
    </ProtectedRoute>
  );
}
