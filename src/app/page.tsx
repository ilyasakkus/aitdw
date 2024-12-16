'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserManagement from '@/components/Admin/UserManagement';

export default function Home() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">
                  {isAdmin ? 'AITDW Yönetim Paneli' : 'AITDW Teknik Yazar Paneli'}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Hoş geldiniz, {profile.username}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-indigo-600 px-4 py-2 text-white rounded-md hover:bg-indigo-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isAdmin ? (
            <UserManagement />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900">
                Teknik Yazar Paneline Hoş Geldiniz
              </h2>
              <p className="mt-2 text-gray-600">
                Bu alan yakında kullanıma açılacaktır.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
