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

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  try {
    requireAuth(req);

    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const productos = unwrapSupabaseResult(
        await supabase.from('productos').select(PRODUCTOS_SELECT).order('nombre')
      );

      sendJson(res, 200, productos.map(mapProductoFromDb));
      return;
    }

    const payload = await readJsonBody(req);
    const productoDb = await mapProductoToDb(supabase, payload);

    const producto = unwrapSupabaseResult(
      await supabase.from('productos').insert(productoDb).select(PRODUCTOS_SELECT).single()
    );

    sendJson(res, 201, mapProductoFromDb(producto));
  } catch (error) {
    handleApiError(res, error);
  }
}
