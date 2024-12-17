'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/documents');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Yönetici Paneli</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-lg font-semibold mb-4">Yönetici İşlemleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-md font-medium mb-2">Kullanıcı Yönetimi</h3>
                <p className="text-sm text-gray-600">Kullanıcıları görüntüle ve yönet</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-md font-medium mb-2">Doküman Yönetimi</h3>
                <p className="text-sm text-gray-600">Dokümanları düzenle ve yönet</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-md font-medium mb-2">Sistem Ayarları</h3>
                <p className="text-sm text-gray-600">Sistem ayarlarını yapılandır</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
