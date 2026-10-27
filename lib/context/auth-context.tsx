'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authAPI, { AuthResponse } from '../api/auth';
import { describeError, getErrorMessage } from '../api';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

// Helper functions for cross-platform storage
const getStorageValue = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value) return value;
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageValue = async (key: string, value: string): Promise<void> => {
  try {
    await Preferences.set({ key, value });
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageValue = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch (e) {
    // Fallback
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export type PostLoginRoute = '/dashboard' | '/register';

export interface LoginResult {
  user: AuthResponse['user'];
  isNewUser: boolean;
  /** Where to send the user, decided from the server's account state (never assumed). */
  nextRoute: PostLoginRoute;
}

/** Complete accounts go to the app; everyone else resumes onboarding at the first unfinished step. */
export function routeAfterLogin(user: { profile_completed?: boolean; is_profile_complete?: boolean }): PostLoginRoute {
  return user.profile_completed === true || user.is_profile_complete === true ? '/dashboard' : '/register';
}

/** Reject anything that is not a well-formed login response, so a bad reply can never "log in". */
export function parseAuthResponse(data: any): AuthResponse {
  const t = data?.tokens;
  const ok =
    t && typeof t === 'object' &&
    typeof t.access === 'string' && t.access.length > 0 &&
    typeof t.refresh === 'string' && t.refresh.length > 0 &&
    data.user && typeof data.user === 'object' && !Array.isArray(data.user);
  if (!ok) throw new Error('Unexpected response from the server. Please try again.');
  return data as AuthResponse;
}

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<LoginResult>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getStorageValue('access_token');
      if (token) {
        refreshUser();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendOtp = async (phone: string) => {
    try {
      await authAPI.sendOtp({ phone });
      toast.success('OTP sent to your phone. Check your messages.');
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Failed to send OTP. Please try again.');
      console.error('Send OTP error:', describeError(error));
      toast.error(errorMsg);
      throw error;
    }
  };

  const login = async (phone: string, otp: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const response = parseAuthResponse(await authAPI.verifyOtp({ phone, otp }));
      await setStorageValue('access_token', response.tokens.access);
      await setStorageValue('refresh_token', response.tokens.refresh);
      setUser(response.user as any);
      toast.success('Login successful! Welcome to Vaishnav Vivaah.');
      return { user: response.user, isNewUser: response.is_new_user === true, nextRoute: routeAfterLogin(response.user) };
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Failed to verify OTP. Please try again.');
      console.error('Login error:', describeError(error));
      toast.error(errorMsg);
      // A readable Error (not the raw axios error) so every caller can show it as-is.
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      // Requires the OTP-verified session; saves account details only (no tokens issued here).
      const response = await authAPI.register(data);
      setUser(response.user as any);
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Registration failed. Please check your details and try again.');
      console.error('Register error:', describeError(error));
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', describeError(error));
    } finally {
      await removeStorageValue('access_token');
      await removeStorageValue('refresh_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response);
    } catch (error) {
      console.error('Refresh user error:', describeError(error));
      await removeStorageValue('access_token');
      await removeStorageValue('refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        sendOtp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
