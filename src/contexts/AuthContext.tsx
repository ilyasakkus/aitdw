'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();
    
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
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUser(session.user);
        setIsAdmin(data?.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = createClientComponentClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Kullanıcı rolünü kontrol et
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Admin ve normal kullanıcı için farklı yönlendirme yolları döndür
      return {
        isAdmin: profile?.role === 'admin',
        redirectPath: profile?.role === 'admin' ? '/admin' : '/documents'
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const supabase = createClientComponentClient();
    try {
      await supabase.auth.signOut();
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
