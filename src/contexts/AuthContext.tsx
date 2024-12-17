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
      console.log('Fetching profile for user:', userId); // Debug log
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Raw profile data:', profileData); // Debug log

      if (!profileData) {
        console.log('No profile found, creating new profile...'); // Debug log
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { id: userId, role: 'user' }
          ])
          .single();

        if (insertError) {
          console.error('Profile creation error:', insertError); // Debug log
          throw insertError;
        }
        
        console.log('New profile created:', newProfile); // Debug log
        return { role: 'user' as Role, email: userEmail };
      }

      const result = { role: profileData.role as Role, email: userEmail };
      console.log('Returning profile data:', result); // Debug log
      return result;
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
      console.log('Starting sign in process...'); // Debug log
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error); // Debug log
        throw error;
      }

      console.log('Auth successful, user:', data.user); // Debug log

      if (data.user) {
        try {
          const profileData = await fetchUserProfile(data.user.id, data.user.email || '');
          console.log('Fetched profile data:', profileData); // Debug log

          // State güncellemelerini yap
          setUser(data.user);
          setProfile(profileData);
          setIsAdmin(profileData.role === 'admin');
          
          // Kısa bir gecikme ekleyelim state'in güncellenmesi için
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (profileData.role === 'admin') {
            console.log('User is admin, redirecting to admin panel...'); // Debug log
            await router.push('/admin');
          } else {
            console.log('User is not admin, redirecting to documents...'); // Debug log
            await router.push('/documents');
          }
          
          console.log('Redirect completed'); // Debug log
        } catch (profileError) {
          console.error('Profile fetch/update error:', profileError); // Debug log
          throw profileError;
        }
      }
    } catch (error) {
      console.error('Sign in process error:', error);
      setAuthError(error instanceof Error ? error.message : 'Sign in failed');
      throw error;
    } finally {
      console.log('Sign in process completed'); // Debug log
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
