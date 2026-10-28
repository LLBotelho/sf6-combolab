import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { playerInternalEmail } from '../lib/username';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error && !['Auth session missing!', 'Auth session missing'].includes(error.message)) {
        setAuthError('Falha ao verificar a sessão. Verifique a internet e tente novamente.');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }).catch(() => {
      if (active) { setAuthError('Não foi possível conectar ao Supabase.'); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  async function signIn(username: string, password: string) {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: playerInternalEmail(username), password });
    if (error) throw new Error('Login não autorizado. Confira o usuário e a senha.');
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Não foi possível sair. Tente novamente.');
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, authError, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requer AuthProvider');
  return ctx;
}
