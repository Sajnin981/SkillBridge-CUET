import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '@/lib/types';
import { authService, type AuthUser } from '@/services/authService';

const TOKEN_KEY = 'skillbridge_token';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const currentUser = await authService.getMe();
      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, role: Role) => {
    const u = await authService.login(email, password, role);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
