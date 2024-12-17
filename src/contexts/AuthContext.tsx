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
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        if (profileError.code === 'PGRST116') {
          console.log('Creating new profile for user:', userId);
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { id: userId, role: 'user', email: userEmail }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw insertError;
          }

          console.log('New profile created:', newProfile);
          return { role: 'user' as Role, email: userEmail };
        }
        throw profileError;
      }

      console.log('Profile data fetched:', profileData);
      return { role: profileData.role as Role, email: userEmail };
    } catch (error) {
      console.error('Profile fetch/create error:', error);
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
      console.log('Starting sign in process...');
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Auth successful, user:', data.user?.id);

      if (data.user) {
        try {
          const profileData = await fetchUserProfile(data.user.id, data.user.email || '');
          console.log('Profile data fetched:', profileData);

          setUser(data.user);
          setProfile(profileData);
          setIsAdmin(profileData.role === 'admin');

          await new Promise(resolve => setTimeout(resolve, 100));

          if (profileData.role === 'admin') {
            console.log('Redirecting to admin...');
            await router.push('/admin');
          } else {
            console.log('Redirecting to documents...');
            await router.push('/documents');
          }
        } catch (profileError) {
          console.error('Profile processing error:', profileError);
          setAuthError('Profil bilgileri alınamadı');
          throw profileError;
        }
      }
    } catch (error) {
      console.error('Sign in process error:', error);
      setAuthError(error instanceof Error ? error.message : 'Giriş başarısız');
      throw error;
    } finally {
      setLoading(false);
      console.log('Sign in process completed');
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
