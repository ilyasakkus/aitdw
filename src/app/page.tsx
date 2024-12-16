'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XMLEditor from '@/components/Editor/XMLEditor';

const defaultXML = ''; // Define the default XML content

export default function Home() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [xmlContent, setXmlContent] = useState(defaultXML);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (isAdmin) {
        router.push('/admin');
      }
    }
  }, [user, loading, router, isAdmin]);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">
                  AITDW Teknik Doküman Yazarı
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

      <main className="flex-1 w-full">
        <div className="h-full">
          <XMLEditor 
            value={xmlContent}
            onChange={setXmlContent}
          />
        </div>
      </main>
    </div>
  );
}
