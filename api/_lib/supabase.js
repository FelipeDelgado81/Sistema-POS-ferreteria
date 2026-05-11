import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from './env.js';
import { createHttpError } from './http.js';

let supabaseAdmin;

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = getRequiredEnv('SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdmin;
}

export function unwrapSupabaseResult(result) {
  if (result.error) {
    throw createHttpError(400, result.error.message, result.error);
  }

  return result.data;
}
