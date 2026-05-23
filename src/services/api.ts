import axios, { type InternalAxiosRequestConfig } from 'axios';
import { supabase } from '@/lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

export default api;
