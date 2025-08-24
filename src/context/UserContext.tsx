// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  registration_number: string;
  whatsapp_number: string;
  initials: string;
}

interface UserContextType {
  user: (UserProfile & { supabaseUser: User }) | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const supabaseUser = session?.user;

      if (supabaseUser) {
        // Now, fetch the profile from your 'profiles' table in Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError.message);
        }
        
        // Extract full_name for initials, fallback to email if not available yet
        const nameForInitials = profile?.full_name || supabaseUser.email || 'G';
        const initials = nameForInitials.split(' ').map((n: string) => n[0]).join('').toUpperCase();

        setUser({
          ...(profile || {
            // Provide default values if profile is not yet created
            id: supabaseUser.id,
            full_name: supabaseUser.user_metadata.full_name || 'New User',
            email: supabaseUser.email || '',
            registration_number: '',
            whatsapp_number: ''
          }),
          initials,
          supabaseUser: supabaseUser
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserAndProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};