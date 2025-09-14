"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'client';
  avatar?: string;
  bio?: string;
  certifications?: string[];
  specializations?: string[];
  hourlyRate?: number;
  preferences?: Record<string, unknown>;
  hasActiveSessions?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresOnboarding?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; requiresOnboarding?: boolean }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
  selectRole: (role: string) => Promise<{ success: boolean; error?: string }>;
  completeTrainerProfile: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  completeClientProfile: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const DEMO_ADMIN = process.env.NEXT_PUBLIC_DEMO_ADMIN === '1';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || 'Request failed');
    }

    return response.json();
  };

  // Load user from token on mount (or enable demo mode)
  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        try {
          const response = await apiCall('/auth/me');
          setUser(response.user);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Demo admin mode: no backend required
      if (DEMO_ADMIN) {
        const demoUser: User = {
          id: 'demo-admin',
          name: 'Demo Admin',
          email: 'admin@gymfonty.demo',
          role: 'admin',
          avatar: undefined,
          hasActiveSessions: true,
        };
        setUser(demoUser);
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // In demo mode, accept any credentials and set role based on email
    if (DEMO_ADMIN) {
      const lowered = (email || '').toLowerCase();
      const role: User['role'] = lowered.includes('admin')
        ? 'admin'
        : lowered.includes('staff') || lowered.includes('trainer')
        ? 'staff'
        : 'client';
      const demoUser: User = {
        id: `demo-${role}`,
        name: role === 'admin' ? 'Demo Admin' : role === 'staff' ? 'Demo Staff' : 'Demo Client',
        email: email || `${role}@gymfonty.demo`,
        role,
        hasActiveSessions: true,
      };
      setUser(demoUser);
      return {
        success: true,
        requiresOnboarding: false,
      };
    }

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return { 
        success: true, 
        requiresOnboarding: response.requiresOnboarding 
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (DEMO_ADMIN) {
      const lowered = (email || '').toLowerCase();
      const role: User['role'] = lowered.includes('admin') ? 'admin' : 'client';
      const demoUser: User = {
        id: `demo-${role}`,
        name: name || (role === 'admin' ? 'Demo Admin' : 'Demo Client'),
        email: email || `${role}@gymfonty.demo`,
        role,
        hasActiveSessions: true,
      };
      setUser(demoUser);
      return { success: true, requiresOnboarding: false };
    }

    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return { 
        success: true, 
        requiresOnboarding: response.requiresOnboarding 
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    if (DEMO_ADMIN) return; // demo user is static
    try {
      const response = await apiCall('/auth/me');
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const selectRole = async (role: string) => {
    if (DEMO_ADMIN) {
      setUser((prev) => (prev ? { ...prev, role: role as User['role'] } : prev));
      return { success: true };
    }
    try {
      const response = await apiCall('/auth/select-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Role selection failed' 
      };
    }
  };

  const completeTrainerProfile = async (data: Record<string, unknown>) => {
    if (DEMO_ADMIN) return { success: true };
    try {
      const response = await apiCall('/auth/complete-trainer-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));

      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile completion failed' 
      };
    }
  };

  const completeClientProfile = async (data: Record<string, unknown>) => {
    if (DEMO_ADMIN) return { success: true };
    try {
      const response = await apiCall('/auth/complete-client-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));

      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile completion failed' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refreshUser,
    selectRole,
    completeTrainerProfile,
    completeClientProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}