import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(requireAdmin = false) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (!loading && requireAdmin && !isAdmin) {
      router.push('/documents');
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  return { user, loading, isAdmin };
} 