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
  let timeoutId: NodeJS.Timeout;

  useEffect(() => {
    let isSubscribed = true;

    const setupAuth = async () => {
      try {
        console.log('Setting up auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isSubscribed) return;

        if (session?.user) {
          console.log('Session found, user:', session.user);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        if (!isSubscribed) return;
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;
      
      console.log('Auth state changed:', event, session);
      setLoading(true);

      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Starting to fetch profile for user:', userId);
      
      // 5 saniyelik timeout ekleyelim
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Profile fetch timeout'));
        }, 5000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Race condition ile timeout kontrolü yapalım
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      clearTimeout(timeoutId);

      if (error) {
        console.error('Error fetching profile:', error);
        // Profil bulunamadıysa varsayılan olarak normal kullanıcı yapalım
        setProfile({
          id: userId,
          user_id: userId,
          username: userId,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setIsAdmin(false);
        return;
      }

      if (!data) {
        console.log('No profile found, creating default profile');
        // Profil yoksa otomatik oluşturalım
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId,
              user_id: userId, 
              username: userId, 
              role: 'user', 
              created_at: new Date().toISOString(), 
              updated_at: new Date().toISOString() 
            }
          ])
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfile({
            id: userId,
            user_id: userId,
            username: userId,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setIsAdmin(false);
          return;
        }

        setProfile(newProfile);
        setIsAdmin(false);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
      setIsAdmin(data.role === 'admin');

    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error);
      // Hata durumunda varsayılan profil
      setProfile({
        id: userId,
        user_id: userId,
        username: userId,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setIsAdmin(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@aitdw.app`,
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      window.location.href = '/auth/login';
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
