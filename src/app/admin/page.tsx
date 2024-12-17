'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserManagement from '@/components/Admin/UserManagement';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin sayfası içeriği */}
      </div>
    </ProtectedRoute>
  );
}
