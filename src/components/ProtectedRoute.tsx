'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (requireAdmin && !isAdmin) {
        router.replace('/documents');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [loading, user, isAdmin, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
} 