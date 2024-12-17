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
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Fetched Profile Data:', profileData); // Debug için

      if (!profileData) {
        // Profil bulunamadıysa yeni profil oluştur
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { id: userId, role: 'user' }
          ])
          .single();

        if (insertError) throw insertError;
        return { role: 'user' as Role, email: userEmail };
      }

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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(session.user);
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (session) {
        const profileData = await fetchUserProfile(session.user.id, session.user.email || '');
        setUser(session.user);
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError(error instanceof Error ? error.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profileData = await fetchUserProfile(data.user.id, data.user.email || '');
        console.log('SignIn - Profile Data:', profileData); // Debug log
        
        await updateUserSession(data.user);
        console.log('SignIn - IsAdmin State:', isAdmin); // Debug log
        
        // Doğrudan profileData'yı kullan
        if (profileData.role === 'admin') {
          console.log('Redirecting to admin panel'); // Debug log
          router.push('/admin');
        } else {
          console.log('Redirecting to documents'); // Debug log
          router.push('/documents');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(error instanceof Error ? error.message : 'Sign in failed');
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
