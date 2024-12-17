'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';

type Role = Database['public']['Tables']['profiles']['Row']['role'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: {
    role: Role;
    email: string;
  } | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: Role; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const mounted = useRef(true);

  const TIMEOUT_DURATION = 30000; // 30 saniye

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('id', userId)
        .single();

      if (profileError) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId, 
              role: 'user', 
              email: userEmail 
            }
          ])
          .select('id, role, email')
          .single();

        if (insertError) {
          throw insertError;
        }

        return { role: 'user' as Role, email: userEmail };
      }

      return { 
        role: profileData.role as Role, 
        email: profileData.email || userEmail 
      };
    } catch (error) {
      console.error('Profile error:', error);
      return { role: 'user' as Role, email: userEmail };
    }
  };

  const updateUserSession = async (sessionUser: User | null) => {
    try {
      if (!sessionUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        return;
      }

      setUser(sessionUser);
      const profileData = await fetchUserProfile(sessionUser.id, sessionUser.email || '');
      
      if (mounted.current) {
        setProfile(profileData);
        const isAdminUser = profileData.role === 'admin';
        setIsAdmin(isAdminUser);
        console.log('User role:', profileData.role, 'isAdmin:', isAdminUser); // Debug için
      }
    } catch (error) {
      console.error('Session update error:', error);
      if (mounted.current) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(session.user);
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        return;
      }

      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id, session.user.email || '');
        setUser(session.user);
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Önce state'i temizle
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Sonra supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // En son yönlendirme
      await router.push('/auth/login');
      router.refresh(); // Router'ı yenile
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // 1. Önce auth işlemini yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setAuthError(authError.message);
        return;
      }

      if (!authData.user) {
        setAuthError('Kullanıcı bilgileri alınamadı');
        return;
      }

      // 2. Profil bilgilerini al
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Profil bulunamazsa oluştur
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { id: authData.user.id, role: 'user', email: authData.user.email }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            setAuthError('Profil oluşturulamadı');
            return;
          }

          // Yeni profili kullan
          setUser(authData.user);
          setProfile({ role: 'user', email: authData.user.email || '' });
          setIsAdmin(false);
        } else {
          setAuthError('Profil bilgileri alınamadı');
          return;
        }
      } else {
        // Mevcut profili kullan
        setUser(authData.user);
        setProfile({ role: profileData.role, email: authData.user.email || '' });
        setIsAdmin(profileData.role === 'admin');
      }

      // 3. Yönlendirme yap
      const redirectPath = profileData?.role === 'admin' ? '/admin' : '/documents';
      router.push(redirectPath);

    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('Giriş işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    profile,
    isAdmin,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
