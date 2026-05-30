import { useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadCurrentUser() {
      try {
        const currentUser = await authApi.getCurrentSession();
        if (!ignore) setUser(currentUser);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setAuthLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      setUser,
    }),
    [user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
