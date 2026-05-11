import { requireAuth } from './_lib/auth.js';
import { allowMethods, handleApiError, sendJson } from './_lib/http.js';
import { getSupabaseAdmin, unwrapSupabaseResult } from './_lib/supabase.js';

function mapCategoriaFromDb(row) {
  return {
    id: row.id,
    name: row.nombre,
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  try {
    requireAuth(req);

    const categorias = unwrapSupabaseResult(
      await getSupabaseAdmin().from('categorias').select('id,nombre').order('nombre')
    );

    sendJson(res, 200, categorias.map(mapCategoriaFromDb));
  } catch (error) {
    handleApiError(res, error);
  }
}
