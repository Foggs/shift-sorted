import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ProfileMetadata } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileMetadata;
  isAuthenticated: boolean;
  loading: boolean;
  updateProfile: (updates: ProfileMetadata) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getProfileFromUser = (user: User | null): ProfileMetadata => {
  if (!user) {
    return {};
  }

  const metadata = user.user_metadata ?? {};
  return {
    role: metadata.role ?? null,
    skills: Array.isArray(metadata.skills) ? metadata.skills : [],
    location: metadata.location ?? null,
  };
};

const pruneUndefined = <T extends Record<string, unknown>>(input: T) => {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const profile = useMemo(() => getProfileFromUser(user), [user]);

  const updateProfile = async (updates: ProfileMetadata) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    const cleanedUpdates = pruneUndefined(updates);
    const nextMetadata = {
      ...(user.user_metadata ?? {}),
      ...cleanedUpdates,
    };

    const { data, error } = await supabase.auth.updateUser({ data: nextMetadata });

    if (!error) {
      setUser(data.user ?? null);
    }

    return { error: error ? new Error(error.message) : null };
  };

  const refreshProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(data.user ?? null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user,
      profile,
      isAuthenticated: Boolean(session?.user),
      loading,
      updateProfile,
      refreshProfile,
      signOut,
    };
  }, [session, user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
