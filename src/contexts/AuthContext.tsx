'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful:', data);
        }

        // Also test auth connection
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Auth connection error:', authError);
        } else {
          console.log('Auth connection successful:', authData);
        }
      } catch (err) {
        console.error('Connection test error:', err);
      }
    };

    testConnection();

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
    setIsAdmin(data.role === 'admin');
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Only allow boss login
      if (username === 'boss') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'boss@aitdw.app',
          password,
        });

        console.log('Sign in attempt response:', { data, error });

        if (error) {
          console.error('Admin login error:', error.message, error);
          throw new Error(`Login failed: ${error.message}`);
        }

        if (data?.user) {
          console.log('Login successful, fetching profile...');
          await fetchProfile(data.user.id);
          console.log('Profile fetched');
        }
        return;
      }

      throw new Error('Invalid username. Please use "boss" to login.');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
