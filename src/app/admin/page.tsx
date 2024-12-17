'use client';

import { useState } from 'react';
import UserManagement from '@/components/Admin/UserManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'documents' | 'settings'>('users');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        {/* Mevcut nav içeriği */}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Mevcut main içeriği */}
      </main>
    </div>
  );
}
