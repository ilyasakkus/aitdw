'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, profile, signOut, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold">
              AITDW
            </Link>
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/documents"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Documents
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">{profile?.username}</span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
