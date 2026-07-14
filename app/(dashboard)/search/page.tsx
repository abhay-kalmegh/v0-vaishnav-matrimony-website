import { ProtectedRoute } from '@/lib/components/protected-route';
import { SearchContent } from '@/components/dashboard/search-content';

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <ProtectedRoute requireProfileComplete>
      <SearchContent />
    </ProtectedRoute>
  );
}
