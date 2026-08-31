"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUser, logoutUser } from "@/app/services/authService";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  // Set up a periodic check for localStorage changes
  // This catches updates from the same tab (like after login)
  useEffect(() => {
    if (isLoading) return;

    const checkForUpdates = setInterval(() => {
      const storedToken = getToken();
      const storedUser = getUser();

      // Update token if it changed
      if (storedToken !== token) {
        setToken(storedToken);
      }

      // Update user if it changed
      if (storedUser && JSON.stringify(storedUser) !== JSON.stringify(user)) {
        setUser(storedUser);
      }
    }, 100); // Check every 100ms for up-to-date state

    return () => clearInterval(checkForUpdates);
  }, [token, user, isLoading]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
  };

  // Compute isAuthenticated based on token state
  const isAuthenticated = !!token;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Custom hook for updating auth state after successful login/registration
 * This forces the auth context to re-read from localStorage
 */
export function useAuthUpdate() {
  const { setToken, setUser } = useAuth();
  
  return {
    refreshAuth: () => {
      const newToken = getToken();
      const newUser = getUser();
      setToken(newToken);
      setUser(newUser);
    }
  };
}
