import { requireAuth } from '../_lib/auth.js';
import { allowMethods, handleApiError, readJsonBody, sendJson } from '../_lib/http.js';
import { mapProductoFromDb, mapProductoToDb } from '../_lib/productos.js';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../_lib/supabase.js';

const PRODUCTOS_SELECT = `
  id,
  codigo_barra,
  nombre,
  descripcion,
  categoria_id,
  proveedor_id,
  precio_compra,
  precio_venta_minorista,
  precio_venta_mayorista,
  stock,
  stock_minimo,
  activo,
  categorias(nombre)
`;

function getProductId(req) {
  return req.query?.id;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PUT', 'DELETE'])) return;

  try {
    requireAuth(req);

    const supabase = getSupabaseAdmin();
    const id = getProductId(req);

    if (req.method === 'GET') {
      const producto = unwrapSupabaseResult(
        await supabase.from('productos').select(PRODUCTOS_SELECT).eq('id', id).single()
      );

      sendJson(res, 200, mapProductoFromDb(producto));
      return;
    }

    if (req.method === 'DELETE') {
      unwrapSupabaseResult(await supabase.from('productos').delete().eq('id', id));
      sendJson(res, 200, { success: true });
      return;
    }

    const payload = await readJsonBody(req);
    const productoDb = await mapProductoToDb(supabase, payload);

    const producto = unwrapSupabaseResult(
      await supabase
        .from('productos')
        .update(productoDb)
        .eq('id', id)
        .select(PRODUCTOS_SELECT)
        .single()
    );

    sendJson(res, 200, mapProductoFromDb(producto));
  } catch (error) {
    handleApiError(res, error);
  }
}
