'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const isAdmin = profile?.role === 'admin';

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100]"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <nav className={`bg-gray-800 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="mx-auto px-2">
          <div className="relative flex h-12 items-center justify-between">
            <div className="flex flex-1 items-center">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/" className="text-white font-bold text-base">
                  AITDW
                </Link>
              </div>
              <div className="ml-4 flex space-x-2">
                <Link
                  href="/documents/parts-catalog"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/documents/parts-catalog')}`}
                >
                  Parça Kataloğu
                </Link>
                <Link
                  href="/documents/operating"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/documents/operating')}`}
                >
                  Kullanım Kılavuzu
                </Link>
                <Link
                  href="/documents/manuals"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/documents/manuals')}`}
                >
                  Kullanıcı El Kitabı
                </Link>
                <Link
                  href="/documents/maintenance"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/documents/maintenance')}`}
                >
                  Bakım Dokümanları
                </Link>
                <Link
                  href="/documents/training"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/documents/training')}`}
                >
                  Eğitim Dokümanları
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-2 py-1 rounded-md text-xs font-medium ${isActive('/admin')}`}
                >
                  Yönetici
                </Link>
              )}
              <span className="text-gray-300 mr-2">{profile?.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
