import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHttpError } from './http';

let supabaseAdmin: SupabaseClient | undefined;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw createHttpError(500, `Variable de entorno requerida no configurada: ${name}`);
  }
  return value;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  supabaseAdmin = createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  return supabaseAdmin;
}

interface SupabaseResult<T> {
  data: T;
  error: { message: string } | null;
}

export function unwrapSupabaseResult<T>(result: SupabaseResult<T>): T {
  if (result.error) {
    throw createHttpError(400, result.error.message, result.error);
  }
  return result.data;
}
