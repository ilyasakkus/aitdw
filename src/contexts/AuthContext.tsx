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

      const response = await fetch('/api/signin', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.user) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      const profileData = await fetchUserProfile(data.user.id, data.user.email || '');
      
      setUser(data.user);
      setProfile(profileData);
      setIsAdmin(profileData.role === 'admin');

      // Yönlendirme
      router.push(profileData.role === 'admin' ? '/admin' : '/documents');

    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(error instanceof Error ? error.message : 'Giriş başarısız');
      throw error;
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
