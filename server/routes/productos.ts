import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';
import { PRODUCTOS_SELECT, mapProductoFromDb, mapProductoToDb } from '../lib/productos';

const router = Router();

router.use(requireAuth);

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
