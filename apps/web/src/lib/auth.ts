'use client';

import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pizi.in/api';

export interface AuthUser {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: AuthUser | null, token?: string | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hydrate: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

// Helper: response text se extra chars hata k JSON parse kare
const parseResponse = async (res: Response) => {
  const text = await res.text();
  // Strip any chars before the first { or [
  const jsonStart = Math.min(
    text.indexOf('{') >= 0 ? text.indexOf('{') : Infinity,
    text.indexOf('[') >= 0 ? text.indexOf('[') : Infinity
  );
  const clean = jsonStart === Infinity ? text : text.substring(jsonStart);
  console.log('[parseResponse] Original starts with:', JSON.stringify(text.substring(0, 5)));
  console.log('[parseResponse] Cleaned starts with:', JSON.stringify(clean.substring(0, 5)));
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('[parseResponse] Parse failed:', e);
    throw new Error('Invalid JSON response from server');
  }
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user, token) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('pizi_user', JSON.stringify(user));
      if (token) localStorage.setItem('pizi_token', token);
    }
    set({ user, token, isAuthenticated: !!user, loading: false });
  },

  login: async (email: string, password: string) => {
    console.log('[LOGIN] Calling:', API_URL + '/auth/login');
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await parseResponse(res);
    console.log('[LOGIN] Body:', JSON.stringify(json));
    if (!res.ok || !json.success) throw new Error(json.message || 'Login failed');

    const user = json?.data?.user || json?.user;
    const token = json?.data?.token || json?.token;
    if (!user || !token) throw new Error('Invalid response');

    localStorage.setItem('pizi_token', token);
    localStorage.setItem('pizi_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, loading: false });
    console.log('[LOGIN] SUCCESS - role:', user.role);
    return user;
  },

  logout: () => {
    localStorage.removeItem('pizi_token');
    localStorage.removeItem('pizi_user');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
    window.location.href = '/login';
  },

  hydrate: async () => {
    if (typeof window === 'undefined') { set({ loading: false }); return; }
    const token = localStorage.getItem('pizi_token');
    const userStr = localStorage.getItem('pizi_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, loading: false });
      } catch { set({ loading: false }); }
    } else {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('pizi_token');
    if (!token) { set({ loading: false }); return; }
    try {
      const res = await fetch(API_URL + '/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
      });
      const json = await parseResponse(res);
      const user = json?.data?.user || json?.data || json?.user;
      if (user && user.id) {
        localStorage.setItem('pizi_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
}));