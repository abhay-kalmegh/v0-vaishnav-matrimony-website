import { ProtectedRoute } from '@/lib/components/protected-route';
import { MessagingContent } from '@/components/dashboard/messaging-content';

export default function MessagesPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <MessagingContent />
    </ProtectedRoute>
  );
}
