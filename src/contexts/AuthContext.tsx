'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthenticatedUserProfile,
} from '@/services/userProfile';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/tokenManager';
import { logoutAction } from '@/app/auth/actions';
import type { UserProfile } from '@/lib/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await getAuthenticatedUserProfile();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to fetch user on load', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (token: string) => {
    setAuthToken(token);
    await fetchUser();
  };

  const logout = () => {
    const token = getAuthToken();

    // Clear auth state on the client immediately for a faster UI response.
    removeAuthToken();
    setUser(null);

    // Call the server action to invalidate the token on the server and handle the redirect.
    // The redirect will cause a full page navigation, tearing down the old state.
    logoutAction(token);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
