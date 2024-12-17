'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  const checkAdminStatus = (email: string, role: Role) => {
    return role === 'admin' || email.startsWith('boss');
  };

  const fetchUserProfile = async (userId: string, userEmail: string): Promise<{ role: Role; email: string }> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        const defaultRole = 'user' as Role;
        return { role: defaultRole, email: userEmail };
      }

      const role = (profileData?.role || 'user') as Role;
      const isAdminUser = checkAdminStatus(userEmail, role);
      setIsAdmin(isAdminUser);

      return { role, email: userEmail };
    } catch (error) {
      console.error('Profile fetch error:', error);
      const defaultRole = 'user' as Role;
      return { role: defaultRole, email: userEmail };
    }
  };

  const updateUserSession = async (sessionUser: User | null) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    setUser(sessionUser);
    const profileData = await fetchUserProfile(sessionUser.id, sessionUser.email || '');
    setProfile(profileData);
    setIsAdmin(checkAdminStatus(sessionUser.email || '', profileData.role));
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted) {
          await updateUserSession(session?.user || null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication error occurred');
        await updateUserSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        await updateUserSession(session?.user || null);
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication error occurred');
        await updateUserSession(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        await updateUserSession(data.user);
        
        // Redirect based on role
        if (isAdmin) {
          router.push('/admin');
        } else {
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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await updateUserSession(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError(error instanceof Error ? error.message : 'Sign out failed');
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
