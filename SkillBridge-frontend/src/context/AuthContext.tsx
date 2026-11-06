import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '@/lib/types';
import { authService, type AuthUser } from '@/services/authService';

type AuthScope = 'admin' | 'user';

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

export function AuthProvider({ children, scope }: { children: ReactNode; scope: AuthScope }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!authService.hasToken(scope)) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const currentUser = await authService.getMe(scope);
      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [scope]);

  const login = useCallback(async (email: string, password: string, role: Role) => {
    if ((scope === 'admin') !== (role === 'admin')) {
      throw new Error('This sign-in page does not support that account type.');
    }
    const u = await authService.login(email, password, role);
    setUser(u);
    return u;
  }, [scope]);

  const logout = useCallback(() => {
    authService.logout(scope);
    setUser(null);
  }, [scope]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
