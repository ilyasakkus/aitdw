'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();

  // Eğer kullanıcı giriş yapmamışsa navbar'ı gösterme
  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/documents" className="text-xl font-bold text-gray-800">
                AITDW
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/documents"
                className={`${
                  pathname === '/documents'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dokümanlar
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${
                    pathname === '/admin'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Yönetici Paneli
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
