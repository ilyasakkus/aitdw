'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Admin sayfası içeriği */}
    </ProtectedRoute>
  );
}
