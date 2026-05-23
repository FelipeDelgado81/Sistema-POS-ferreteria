import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/types';

type LoginResult =
  | { success: true }
  | { success: false; error: string };

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const role = (user.app_metadata?.role as AuthUser['role']) ?? 'seller';
  const name = (user.user_metadata?.name as string) ?? user.email ?? '';
  return { email: user.email ?? '', name, role };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(toAuthUser(data.session?.user ?? null));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user ?? null));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
