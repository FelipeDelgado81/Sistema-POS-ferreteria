import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Row = Record<string, any>;
type Payload = Record<string, any>;

const PROVEEDORES_SELECT = 'id, rut, razon_social, contacto, telefono, email, created_at';

function mapProveedorFromDb(row: Row) {
  return {
    id: row.id,
    rut: row.rut || '',
    razonSocial: row.razon_social,
    contacto: row.contacto || '',
    telefono: row.telefono || '',
    email: row.email || '',
    createdAt: row.created_at,
  };
}

function validateProveedorPayload(payload: Payload): void {
  if (!String(payload.razonSocial || '').trim()) {
    throw createHttpError(400, 'La razón social es obligatoria');
  }
}

function mapProveedorToDb(payload: Payload) {
  return {
    razon_social: String(payload.razonSocial).trim(),
    rut: String(payload.rut || '').trim() || null,
    contacto: String(payload.contacto || '').trim() || null,
    telefono: String(payload.telefono || '').trim() || null,
    email: String(payload.email || '').trim() || null,
  };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const proveedores = unwrapSupabaseResult(
      await getSupabaseAdmin().from('proveedores').select(PROVEEDORES_SELECT).order('razon_social'),
    ) as Row[];

    res.status(200).json(proveedores.map(mapProveedorFromDb));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    validateProveedorPayload(req.body);

    const proveedor = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('proveedores')
        .insert(mapProveedorToDb(req.body))
        .select(PROVEEDORES_SELECT)
        .single(),
    ) as Row;

    res.status(201).json(mapProveedorFromDb(proveedor));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const proveedor = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('proveedores')
        .select(PROVEEDORES_SELECT)
        .eq('id', req.params.id)
        .single(),
    ) as Row;

    res.status(200).json(mapProveedorFromDb(proveedor));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    validateProveedorPayload(req.body);

    const proveedor = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('proveedores')
        .update(mapProveedorToDb(req.body))
        .eq('id', req.params.id)
        .select(PROVEEDORES_SELECT)
        .single(),
    ) as Row;

    res.status(200).json(mapProveedorFromDb(proveedor));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    unwrapSupabaseResult(
      await getSupabaseAdmin().from('proveedores').delete().eq('id', req.params.id),
    );
    res.status(200).json({ success: true });
  }),
);

export default router;
