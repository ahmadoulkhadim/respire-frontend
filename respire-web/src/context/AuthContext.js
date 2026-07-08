import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/auth';
import { getUser } from '../services/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('respire_token');
    const userId = localStorage.getItem('respire_user_id');
    if (token && userId) {
      getUser(Number(userId))
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('respire_token');
          localStorage.removeItem('respire_user_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem('respire_token', res.access_token);
    localStorage.setItem('respire_user_id', String(res.user_id));
    const userData = await getUser(res.user_id);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    localStorage.setItem('respire_token', res.access_token);
    localStorage.setItem('respire_user_id', String(res.user_id));
    const userData = await getUser(res.user_id);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch {}
    localStorage.removeItem('respire_token');
    localStorage.removeItem('respire_user_id');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
