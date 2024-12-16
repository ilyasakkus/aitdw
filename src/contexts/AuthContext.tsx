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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Admin users mapping
      const adminEmails: { [key: string]: string } = {
        'admin': 'admin@aitdw.app',
        'boss': 'boss@aitdw.app'
      };

      if (adminEmails[username]) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmails[username],
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

      throw new Error('Only admin login is supported at the moment');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
