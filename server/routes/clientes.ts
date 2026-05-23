import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Row = Record<string, any>;
type Payload = Record<string, any>;

const CLIENTES_SELECT = `
  id,
  razon_social,
  rut,
  direccion,
  email,
  telefono,
  tipo,
  created_at,
  fiados(saldo_pendiente, estado)
`;

function mapClienteFromDb(row: Row) {
  const deuda = (row.fiados || [])
    .filter((f: Row) => f.estado === 'pendiente')
    .reduce((sum: number, f: Row) => sum + Number(f.saldo_pendiente), 0);

  return {
    id: row.id,
    razonSocial: row.razon_social,
    rut: row.rut || '',
    direccion: row.direccion || '',
    email: row.email || '',
    telefono: row.telefono || '',
    tipo: row.tipo === 'empresa' ? 'Empresa' : 'Persona',
    deuda,
    createdAt: row.created_at,
  };
}

function validateClientePayload(payload: Payload): void {
  if (!String(payload.razonSocial || '').trim()) {
    throw createHttpError(400, 'La razón social es obligatoria');
  }
}

function mapClienteToDb(payload: Payload) {
  return {
    razon_social: String(payload.razonSocial).trim(),
    rut: String(payload.rut || '').trim() || null,
    direccion: String(payload.direccion || '').trim() || null,
    email: String(payload.email || '').trim() || null,
    telefono: String(payload.telefono || '').trim() || null,
    tipo: String(payload.tipo || 'persona').toLowerCase(),
  };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const clientes = unwrapSupabaseResult(
      await getSupabaseAdmin().from('clientes').select(CLIENTES_SELECT).order('razon_social'),
    ) as Row[];

    res.status(200).json(clientes.map(mapClienteFromDb));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = req.body;
    if (!['persona', 'empresa'].includes(String(payload.tipo || '').toLowerCase())) {
      throw createHttpError(400, 'El tipo debe ser persona o empresa');
    }
    validateClientePayload(payload);

    const cliente = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('clientes')
        .insert(mapClienteToDb(payload))
        .select(CLIENTES_SELECT)
        .single(),
    ) as Row;

    res.status(201).json(mapClienteFromDb(cliente));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const cliente = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('clientes')
        .select(CLIENTES_SELECT)
        .eq('id', req.params.id)
        .single(),
    ) as Row;

    res.status(200).json(mapClienteFromDb(cliente));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    validateClientePayload(req.body);

    const cliente = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('clientes')
        .update(mapClienteToDb(req.body))
        .eq('id', req.params.id)
        .select(CLIENTES_SELECT)
        .single(),
    ) as Row;

    res.status(200).json(mapClienteFromDb(cliente));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    unwrapSupabaseResult(
      await getSupabaseAdmin().from('clientes').delete().eq('id', req.params.id),
    );
    res.status(200).json({ success: true });
  }),
);

export default router;
