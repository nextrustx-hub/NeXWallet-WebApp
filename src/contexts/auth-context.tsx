"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, getToken, setToken, removeToken } from "@/lib/api";
import type { User, RegisterPayload, AccountTier } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  tier: AccountTier | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<AccountTier | null>(null);
  const [hasToken] = useState(() => !!getToken());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setTier(res.data.user.role ?? null);
      }
    } catch {
      removeToken();
      setUser(null);
      setTier(null);
    }
  }, []);

  // Validate session on mount
  useEffect(() => {
    if (!hasToken) {
      // No token — just stop loading, no API call needed
      const id = requestAnimationFrame(() => setIsLoading(false));
      return () => cancelAnimationFrame(id);
    }

    api
      .getMe()
      .then((res) => {
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          setTier(res.data.user.role ?? null);
        }
      })
      .catch(() => {
        removeToken();
        setUser(null);
        setTier(null);
      })
      .finally(() => setIsLoading(false));
  }, [hasToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setTier(res.tier);
    // Fetch full user profile
    const meRes = await api.getMe();
    if (meRes.success && meRes.data?.user) {
      setUser(meRes.data.user);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.register(payload);
    setToken(res.access_token);
    setTier(res.tier);
    // Fetch full user profile
    const meRes = await api.getMe();
    if (meRes.success && meRes.data?.user) {
      setUser(meRes.data.user);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setTier(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider.");
  }
  return context;
}
