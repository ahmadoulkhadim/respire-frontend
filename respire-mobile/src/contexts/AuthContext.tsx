import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = { surnom: string; email: string; motdepasse: string; consentGiven?: boolean };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (surnom: string, email: string, motdepasse: string) => Promise<void>;
  login: (email: string, motdepasse: string) => Promise<boolean>;
  logout: () => Promise<void>;
  consent: () => Promise<void>;
  consentGiven: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then((data) => {
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const consentGiven = user?.consentGiven ?? false;

  const signup = async (surnom: string, email: string, motdepasse: string) => {
    const u = { surnom, email, motdepasse, consentGiven: false };
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const consent = async () => {
    if (!user) return;
    const updated = { ...user, consentGiven: true };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const login = async (email: string, motdepasse: string) => {
    const data = await AsyncStorage.getItem('user');
    if (!data) return false;
    const u: User = JSON.parse(data);
    if (u.email.toLowerCase() === email.toLowerCase() && u.motdepasse === motdepasse) {
      setUser(u);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, consent, consentGiven }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
