import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Add profile data
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // New state for profile
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect for authentication state changes and initial session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false); // Set loading to false after initial auth state is known

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (location.pathname === '/login') {
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    // Initial session check (redundant with onAuthStateChange 'INITIAL_SESSION' but good for explicit handling)
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
      if (!initialSession && location.pathname !== '/login') {
        navigate('/login');
      } else if (initialSession && location.pathname === '/login') {
        navigate('/');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Effect for fetching and listening to user profile
  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
        return;
      }
      setProfile(data as Profile);
    };

    if (user) {
      fetchUserProfile(user.id);

      // Set up real-time listener for this specific user's profile
      const profileChannel = supabase
        .channel(`profile_changes:${user.id}`) // Unique channel name per user
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          setProfile(payload.new as Profile);
        })
        .subscribe();

      return () => {
        profileChannel.unsubscribe();
      };
    } else {
      setProfile(null); // Clear profile if no user
    }
  }, [user]); // Re-run this effect when the user object changes

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Loading application...</h1>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, profile, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};