import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Row = Record<string, any>;

const FIADOS_SELECT = `
  id,
  venta_id,
  cliente_id,
  saldo_pendiente,
  estado,
  fecha,
  ventas(total),
  abonos_fiados(id, monto, fecha, notas)
`;

function relacionUno(value: unknown): Row | null {
  if (Array.isArray(value)) return (value[0] as Row) ?? null;
  return (value as Row) ?? null;
}

function mapFiadoFromDb(row: Row) {
  const venta = relacionUno(row.ventas);
  const abonos = (row.abonos_fiados || [])
    .map((a: Row) => ({
      id: a.id,
      monto: Number(a.monto),
      fecha: a.fecha,
      notas: a.notas ?? null,
    }))
    .sort((a: Row, b: Row) => String(b.fecha).localeCompare(String(a.fecha)));

  const montoOriginal = venta?.total != null ? Number(venta.total) : null;

  return {
    id: row.id,
    ventaId: row.venta_id ?? null,
    clienteId: row.cliente_id,
    montoOriginal,
    saldoPendiente: Number(row.saldo_pendiente),
    estado: row.estado,
    fecha: row.fecha,
    abonos,
  };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { clienteId, estado } = req.query as Record<string, string>;

    let query = getSupabaseAdmin()
      .from('fiados')
      .select(FIADOS_SELECT)
      .order('fecha', { ascending: false });

    if (clienteId) query = query.eq('cliente_id', clienteId);
    if (estado) query = query.eq('estado', estado);

    const fiados = unwrapSupabaseResult(await query) as Row[];
    res.status(200).json(fiados.map(mapFiadoFromDb));
  }),
);

router.post(
  '/:id/abonos',
  asyncHandler(async (req, res) => {
    const monto = Number(req.body?.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      throw createHttpError(400, 'El monto del abono debe ser mayor a cero');
    }

    const notas = String(req.body?.notas || '').trim() || null;

    unwrapSupabaseResult(
      await getSupabaseAdmin().rpc('registrar_abono', {
        p_fiado_id: req.params.id,
        p_monto: monto,
        p_notas: notas,
        p_usuario: req.user?.name || req.user?.email || null,
      }),
    );

    const fiado = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('fiados')
        .select(FIADOS_SELECT)
        .eq('id', req.params.id)
        .single(),
    ) as Row;

    res.status(201).json(mapFiadoFromDb(fiado));
  }),
);

export default router;
