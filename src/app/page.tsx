'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const defaultXML = ''; // Define the default XML content

export default function Home() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        // Kullanıcı giriş yapmışsa documents sayfasına yönlendir
        router.push('/documents');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return null; // Ana sayfa direkt yönlendirme yapacak
}
