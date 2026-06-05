import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem('calocount_token')
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('calocount_token'));

  const setToken = (t: string) => {
    localStorage.setItem('calocount_token', t);
    setTokenState(t);
  };

  const logout = () => {
    localStorage.removeItem('calocount_token');
    setTokenState(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      getMe()
        .then(setUser)
        .catch(logout)
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
