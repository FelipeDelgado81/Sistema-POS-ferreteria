import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, createHttpError } from '../lib/http';
import { getSupabaseAdmin, unwrapSupabaseResult } from '../lib/supabase';

const router = Router();

type Row = Record<string, any>;
type Payload = Record<string, any>;

const CAJA_SELECT = `
  id,
  fecha,
  estado,
  fondo_inicial,
  efectivo_fisico,
  diferencia,
  created_at,
  closed_at
`;

function ventaLineaTipo(medioPago: string): 'venta_efectivo' | 'venta_tarjeta' | 'venta_fiado' {
  if (medioPago === 'tarjeta') return 'venta_tarjeta';
  if (medioPago === 'fiado') return 'venta_fiado';
  return 'venta_efectivo';
}

async function buildCajaActual(cajaRow: Row | null) {
  if (!cajaRow) return null;

  const admin = getSupabaseAdmin();

  const ventas = unwrapSupabaseResult(
    await admin
      .from('ventas')
      .select('id, fecha, total, medio_pago')
      .eq('estado', 'completada')
      .gte('fecha', cajaRow.created_at)
      .order('fecha'),
  ) as Row[];

  const movimientos = unwrapSupabaseResult(
    await admin
      .from('movimientos_caja')
      .select('id, tipo, monto, descripcion, usuario, created_at')
      .eq('caja_id', cajaRow.id)
      .order('created_at'),
  ) as Row[];

  let ventasEfectivo = 0;
  let ventasTarjeta = 0;
  let ventasFiado = 0;
  for (const v of ventas) {
    const total = Number(v.total);
    if (v.medio_pago === 'tarjeta') ventasTarjeta += total;
    else if (v.medio_pago === 'fiado') ventasFiado += total;
    else ventasEfectivo += total;
  }

  let ingresos = 0;
  let retiros = 0;
  for (const m of movimientos) {
    if (m.tipo === 'retiro') retiros += Number(m.monto);
    else ingresos += Number(m.monto);
  }

  const fondoInicial = Number(cajaRow.fondo_inicial);
  const efectivoEsperado = fondoInicial + ventasEfectivo + ingresos - retiros;

  const lineas = [
    {
      hora: cajaRow.created_at as string,
      tipo: 'apertura' as const,
      descripcion: 'Fondo Fijo Inicial',
      monto: fondoInicial,
      usuario: '',
    },
    ...ventas.map((v) => ({
      hora: v.fecha as string,
      tipo: ventaLineaTipo(v.medio_pago),
      descripcion: `Venta #${String(v.id).slice(0, 8)}`,
      monto: Number(v.total),
      usuario: '',
    })),
    ...movimientos.map((m) => ({
      hora: m.created_at as string,
      tipo: m.tipo as 'ingreso' | 'retiro',
      descripcion: m.descripcion || (m.tipo === 'retiro' ? 'Retiro de efectivo' : 'Ingreso de efectivo'),
      monto: Number(m.monto),
      usuario: m.usuario || '',
    })),
  ].sort((a, b) => a.hora.localeCompare(b.hora));

  return {
    id: cajaRow.id,
    fecha: cajaRow.fecha,
    estado: cajaRow.estado,
    fondoInicial,
    ventasEfectivo,
    ventasTarjeta,
    ventasFiado,
    ingresos,
    retiros,
    efectivoEsperado,
    efectivoFisico: cajaRow.efectivo_fisico != null ? Number(cajaRow.efectivo_fisico) : null,
    diferencia: cajaRow.diferencia != null ? Number(cajaRow.diferencia) : null,
    abiertaAt: cajaRow.created_at,
    cerradaAt: cajaRow.closed_at,
    lineas,
  };
}

async function fetchCajaHoy(): Promise<Row | null> {
  const rows = unwrapSupabaseResult(
    await getSupabaseAdmin()
      .from('caja_diaria')
      .select(CAJA_SELECT)
      .eq('fecha', new Date().toISOString().slice(0, 10))
      .limit(1),
  ) as Row[];

  return rows[0] ?? null;
}

router.use(requireAuth);

router.get(
  '/actual',
  asyncHandler(async (_req, res) => {
    const caja = await fetchCajaHoy();
    res.status(200).json(await buildCajaActual(caja));
  }),
);

router.post(
  '/abrir',
  asyncHandler(async (req, res) => {
    const payload: Payload = req.body;
    const fondoInicial = Number(payload.fondoInicial);

    if (!Number.isFinite(fondoInicial) || fondoInicial < 0) {
      throw createHttpError(400, 'El fondo inicial debe ser un monto válido');
    }

    const existente = await fetchCajaHoy();
    if (existente) {
      throw createHttpError(409, 'La caja de hoy ya fue abierta');
    }

    const caja = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('caja_diaria')
        .insert({ fondo_inicial: fondoInicial, estado: 'abierta' })
        .select(CAJA_SELECT)
        .single(),
    ) as Row;

    res.status(201).json(await buildCajaActual(caja));
  }),
);

router.post(
  '/movimiento',
  asyncHandler(async (req, res) => {
    const payload: Payload = req.body;
    const monto = Number(payload.monto);

    if (!['ingreso', 'retiro'].includes(payload.tipo)) {
      throw createHttpError(400, 'El tipo debe ser ingreso o retiro');
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      throw createHttpError(400, 'El monto debe ser mayor a cero');
    }

    const caja = await fetchCajaHoy();
    if (!caja) {
      throw createHttpError(409, 'No hay una caja abierta hoy');
    }
    if (caja.estado !== 'abierta') {
      throw createHttpError(409, 'La caja ya fue cerrada');
    }

    unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('movimientos_caja')
        .insert({
          caja_id: caja.id,
          tipo: payload.tipo,
          monto,
          descripcion: String(payload.descripcion || '').trim() || null,
          usuario: req.user?.name || req.user?.email || null,
        }),
    );

    res.status(201).json(await buildCajaActual(caja));
  }),
);

router.post(
  '/cerrar',
  asyncHandler(async (req, res) => {
    const payload: Payload = req.body;
    const efectivoFisico = Number(payload.efectivoFisico);

    if (!Number.isFinite(efectivoFisico) || efectivoFisico < 0) {
      throw createHttpError(400, 'El efectivo físico debe ser un monto válido');
    }

    const cajaRow = await fetchCajaHoy();
    if (!cajaRow) {
      throw createHttpError(409, 'No hay una caja abierta hoy');
    }
    if (cajaRow.estado !== 'abierta') {
      throw createHttpError(409, 'La caja ya fue cerrada');
    }

    const estado = await buildCajaActual(cajaRow);
    const efectivoEsperado = estado!.efectivoEsperado;
    const diferencia = efectivoFisico - efectivoEsperado;

    const actualizada = unwrapSupabaseResult(
      await getSupabaseAdmin()
        .from('caja_diaria')
        .update({
          estado: 'cerrada',
          ventas_efectivo: estado!.ventasEfectivo,
          ventas_tarjeta: estado!.ventasTarjeta,
          ingresos: estado!.ingresos,
          retiros: estado!.retiros,
          efectivo_esperado: efectivoEsperado,
          efectivo_fisico: efectivoFisico,
          diferencia,
          closed_at: new Date().toISOString(),
        })
        .eq('id', cajaRow.id)
        .select(CAJA_SELECT)
        .single(),
    ) as Row;

    res.status(200).json(await buildCajaActual(actualizada));
  }),
);

export default router;
