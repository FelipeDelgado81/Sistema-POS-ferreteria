import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';
import {
  PRODUCTOS_SELECT,
  mapProductoFromDb,
  mapProductoToDb,
  validateProductoPayload,
  resolveCategoriasBulk,
  buildProductoRowBulk,
} from '../lib/productos';

const router = Router();

router.use(requireAuth);

const MAX_IMPORT = 1000;

// Consulta en lotes qué códigos ya existen (evita URLs gigantes con muchos `in`).
async function fetchCodigosExistentes(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  codigos: string[],
): Promise<Set<string>> {
  const existentes = new Set<string>();
  const CHUNK = 300;
  for (let i = 0; i < codigos.length; i += CHUNK) {
    const lote = codigos.slice(i, i + CHUNK);
    const rows = unwrapSupabaseResult(
      await supabase.from('productos').select('codigo_barra').in('codigo_barra', lote),
    ) as { codigo_barra: string }[];
    for (const r of rows) existentes.add(r.codigo_barra);
  }
  return existentes;
}

router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const productos = req.body?.productos;
    if (!Array.isArray(productos) || productos.length === 0) {
      throw createHttpError(400, 'Debe enviar al menos un producto para importar');
    }
    if (productos.length > MAX_IMPORT) {
      throw createHttpError(400, `Máximo ${MAX_IMPORT} productos por importación`);
    }

    const supabase = getSupabaseAdmin();
    const errores: { fila: number; mensaje: string }[] = [];
    const validos: Record<string, any>[] = [];

    productos.forEach((p: Record<string, any>, i: number) => {
      try {
        validateProductoPayload(p);
        validos.push(p);
      } catch (err) {
        errores.push({ fila: i + 1, mensaje: err instanceof Error ? err.message : 'Fila inválida' });
      }
    });

    if (validos.length === 0) {
      res.status(200).json({ creados: 0, actualizados: 0, errores });
      return;
    }

    const catMap = await resolveCategoriasBulk(
      supabase,
      validos.filter((p) => !p.categoryId).map((p) => String(p.category || '').trim()),
    );

    // Deduplicar por código dentro del archivo (la última fila gana).
    const porCodigo = new Map<string, Record<string, any>>();
    for (const p of validos) {
      const row = buildProductoRowBulk(p, catMap);
      porCodigo.set(row.codigo_barra, row);
    }
    const rows = Array.from(porCodigo.values());

    const existentes = await fetchCodigosExistentes(
      supabase,
      rows.map((r) => r.codigo_barra),
    );

    unwrapSupabaseResult(
      await supabase.from('productos').upsert(rows, { onConflict: 'codigo_barra' }),
    );

    const actualizados = rows.filter((r) => existentes.has(r.codigo_barra)).length;
    const creados = rows.length - actualizados;

    res.status(200).json({ creados, actualizados, errores });
  }),
);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const supabase = getSupabaseAdmin();
    const productos = unwrapSupabaseResult(
      await supabase.from('productos').select(PRODUCTOS_SELECT).order('nombre'),
    ) as any[];

    res.status(200).json(productos.map(mapProductoFromDb));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const productoDb = await mapProductoToDb(supabase, req.body);

    const producto = unwrapSupabaseResult(
      await supabase.from('productos').insert(productoDb).select(PRODUCTOS_SELECT).single(),
    );

    res.status(201).json(mapProductoFromDb(producto as any));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const producto = unwrapSupabaseResult(
      await supabase.from('productos').select(PRODUCTOS_SELECT).eq('id', req.params.id).single(),
    );

    res.status(200).json(mapProductoFromDb(producto as any));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const productoDb = await mapProductoToDb(supabase, req.body);

    const producto = unwrapSupabaseResult(
      await supabase
        .from('productos')
        .update(productoDb)
        .eq('id', req.params.id)
        .select(PRODUCTOS_SELECT)
        .single(),
    );

    res.status(200).json(mapProductoFromDb(producto as any));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    unwrapSupabaseResult(await supabase.from('productos').delete().eq('id', req.params.id));
    res.status(200).json({ success: true });
  }),
);

export default router;
