'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authAPI, { AuthResponse } from '../api/auth';
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

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      console.error('Send OTP error:', error);
      toast.error(errorMsg);
      throw error;
    }
  };

  const login = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOtp({ phone, otp });
      await setStorageValue('access_token', response.tokens.access);
      await setStorageValue('refresh_token', response.tokens.refresh);
      setUser(response.user as any);
      toast.success('Login successful! Welcome to Vaishnav Vivaah.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.';
      console.error('Login error:', error);
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      await setStorageValue('access_token', response.tokens.access);
      await setStorageValue('refresh_token', response.tokens.refresh);
      setUser(response.user as any);
      toast.success('Registration successful! Welcome to Vaishnav Vivaah.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed. Please check your details and try again.';
      console.error('Register error:', error);
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
      console.error('Logout error:', error);
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
      console.error('Refresh user error:', error);
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
