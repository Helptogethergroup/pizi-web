import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pizi.in/api';
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://pizi.in/storage';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Accept': 'application/json' },
  timeout: 30000,
  // Custom transform: strip garbage chars before JSON
  transformResponse: [
    (data) => {
      if (typeof data !== 'string') return data;
      // Find first { or [ and strip everything before
      const jsonStart = Math.min(
        data.indexOf('{') >= 0 ? data.indexOf('{') : Infinity,
        data.indexOf('[') >= 0 ? data.indexOf('[') : Infinity
      );
      const clean = jsonStart === Infinity ? data : data.substring(jsonStart);
      try {
        return JSON.parse(clean);
      } catch {
        return data;
      }
    },
  ],
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pizi_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
        localStorage.removeItem('pizi_token');
        localStorage.removeItem('pizi_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const imageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${STORAGE_URL}${path}`;
  return `${STORAGE_URL}/${path}`;
};

export const formatINR = (amount: number | string | null | undefined): string => {
  const n = Number(amount);
  if (!n || isNaN(n)) return '₹0';
  return '₹' + n.toLocaleString('en-IN');
};