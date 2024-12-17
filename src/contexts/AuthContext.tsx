'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ isAdmin: boolean; redirectPath: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ isAdmin: false, redirectPath: '/' }),
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    // İlk render'da localStorage'dan admin durumunu al
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAdmin') === 'true';
    }
    return false;
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // İlk yükleme için session kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Session değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    async function handleSession(session: Session | null) {
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }

          if (!profile) {
            console.error('No profile found');
            throw new Error('Kullanıcı profili bulunamadı');
          }

          console.log('Profile data:', profile);
          setUser(session.user);
          const adminStatus = profile.role === 'admin';
          console.log('Is admin?', adminStatus, 'Role:', profile.role);
          setIsAdmin(adminStatus);
          localStorage.setItem('isAdmin', adminStatus ? 'true' : 'false');
        } catch (error) {
          console.error('Session handling error:', error);
          setUser(null);
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
      }
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Auth data:', data);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Profil bilgileri alınamadı');
      }

      if (!profile) {
        console.error('No profile found');
        throw new Error('Kullanıcı profili bulunamadı');
      }

      console.log('Profile data:', profile);
      const adminStatus = profile.role === 'admin';
      console.log('Is admin?', adminStatus, 'Role:', profile.role);

      localStorage.setItem('isAdmin', adminStatus ? 'true' : 'false');

      return {
        isAdmin: adminStatus,
        redirectPath: adminStatus ? '/admin' : '/documents'
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAdmin');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
