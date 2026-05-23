import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

interface CategoriaRow {
  id: string;
  nombre: string;
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const categorias = unwrapSupabaseResult(
      await getSupabaseAdmin().from('categorias').select('id,nombre').order('nombre'),
    ) as CategoriaRow[];

    res.status(200).json(categorias.map((row) => ({ id: row.id, name: row.nombre })));
  }),
);

export default router;
