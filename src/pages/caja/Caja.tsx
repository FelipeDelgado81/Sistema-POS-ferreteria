import {
  Wallet,
  Banknote,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Modal from '@/components/shared/Modal';
import type { CajaLinea, CajaLineaTipo } from '@/types';
import { useCaja } from './hooks/useCaja';

const money = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

const LINEA_LABEL: Record<CajaLineaTipo, string> = {
  apertura: 'Apertura',
  venta_efectivo: 'Venta Efectivo',
  venta_tarjeta: 'Venta Tarjeta',
  venta_fiado: 'Venta Fiado',
  ingreso: 'Ingreso',
  retiro: 'Retiro',
};

const LINEA_STYLE: Record<CajaLineaTipo, string> = {
  apertura: 'text-slate-600',
  venta_efectivo: 'text-emerald-600',
  venta_tarjeta: 'text-blue-600',
  venta_fiado: 'text-amber-600',
  ingreso: 'text-emerald-600',
  retiro: 'text-rose-600',
};

function montoLinea(l: CajaLinea): string {
  if (l.tipo === 'retiro') return `- ${money(l.monto)}`;
  if (l.tipo === 'apertura') return money(l.monto);
  return `+ ${money(l.monto)}`;
}

export default function Caja() {
  const c = useCaja();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Caja</h1>
          <p className="text-slate-500">Apertura, movimientos y cierre diario</p>
        </div>
        {c.cajaAbierta && (
          <div className="flex gap-2">
            <button
              onClick={() => c.openMovimiento('ingreso')}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
              Ingreso
            </button>
            <button
              onClick={() => c.openMovimiento('retiro')}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowDownCircle className="w-4 h-4 text-rose-600" />
              Retiro
            </button>
            <button
              onClick={c.openCerrar}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Lock className="w-4 h-4" />
              Cerrar Caja
            </button>
          </div>
        )}
      </div>

      {c.loading && (
        <div className="py-20 text-center text-slate-500">Cargando caja…</div>
      )}

      {c.isError && !c.loading && (
        <div className="py-20 text-center text-rose-600">
          No se pudo cargar la caja. Intenta de nuevo.
        </div>
      )}

      {!c.loading && !c.isError && !c.caja && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
            <Unlock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">La caja de hoy no está abierta</h2>
            <p className="text-slate-500">Abre la caja con el fondo fijo inicial para registrar ventas y movimientos.</p>
          </div>
          <button
            onClick={c.openAbrir}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Unlock className="w-4 h-4" />
            Abrir Caja
          </button>
        </div>
      )}

      {!c.loading && !c.isError && c.caja && (
        <>
          {c.caja.estado === 'cerrada' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">Caja cerrada</p>
                <p className="text-sm text-emerald-700">
                  Cierre con {c.caja.diferencia === 0
                    ? 'cuadre exacto'
                    : `${c.caja.diferencia! > 0 ? 'sobrante' : 'faltante'} de ${money(Math.abs(c.caja.diferencia!))}`}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Wallet className="w-6 h-6" />}
              tone="slate"
              label="Fondo Fijo (Inicial)"
              value={money(c.caja.fondoInicial)}
            />
            <SummaryCard
              icon={<Banknote className="w-6 h-6" />}
              tone="emerald"
              label="Ventas en Efectivo"
              value={money(c.caja.ventasEfectivo)}
            />
            <SummaryCard
              icon={<CreditCard className="w-6 h-6" />}
              tone="blue"
              label="Ventas Tarjeta"
              value={money(c.caja.ventasTarjeta)}
            />
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Efectivo Esperado</p>
                <p className="text-2xl font-bold text-orange-700">{money(c.caja.efectivoEsperado)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Movimientos del Día</h2>
              {(c.caja.ingresos > 0 || c.caja.retiros > 0) && (
                <span className="text-sm text-slate-500">
                  Ingresos {money(c.caja.ingresos)} · Retiros {money(c.caja.retiros)}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {c.caja.lineas.map((l, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">{hora(l.hora)}</td>
                      <td className="px-6 py-4">
                        <span className={cn('font-medium', LINEA_STYLE[l.tipo])}>
                          {LINEA_LABEL[l.tipo]}
                        </span>
                      </td>
                      <td className="px-6 py-4">{l.descripcion}</td>
                      <td className={cn('px-6 py-4 font-medium', LINEA_STYLE[l.tipo])}>
                        {montoLinea(l)}
                      </td>
                      <td className="px-6 py-4">{l.usuario || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: abrir caja */}
      <Modal isOpen={c.modalActivo === 'abrir'} onClose={c.cerrarModal} title="Abrir Caja">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fondo Fijo Inicial</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
              <input
                type="number"
                value={c.fondoInicial}
                onChange={(e) => c.setFondoInicial(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-500 transition-all"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>
          <button
            disabled={c.saving || c.fondoInicial === ''}
            onClick={c.handleAbrir}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
          >
            <Unlock className="w-5 h-5" />
            Confirmar Apertura
          </button>
        </div>
      </Modal>

      {/* Modal: ingreso / retiro */}
      <Modal
        isOpen={c.modalActivo === 'movimiento'}
        onClose={c.cerrarModal}
        title={c.movimientoTipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Retiro'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
              <input
                type="number"
                value={c.montoMovimiento}
                onChange={(e) => c.setMontoMovimiento(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-500 transition-all"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <input
              type="text"
              value={c.descripcionMovimiento}
              onChange={(e) => c.setDescripcionMovimiento(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 transition-all"
              placeholder={c.movimientoTipo === 'ingreso' ? 'Ej: aporte de caja' : 'Ej: pago a proveedor'}
            />
          </div>
          <button
            disabled={c.saving || c.montoMovimiento === ''}
            onClick={c.handleMovimiento}
            className={cn(
              'w-full py-3 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2',
              c.movimientoTipo === 'ingreso'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700',
            )}
          >
            {c.movimientoTipo === 'ingreso' ? (
              <ArrowUpCircle className="w-5 h-5" />
            ) : (
              <ArrowDownCircle className="w-5 h-5" />
            )}
            Confirmar {c.movimientoTipo === 'ingreso' ? 'Ingreso' : 'Retiro'}
          </button>
        </div>
      </Modal>

      {/* Modal: cerrar caja */}
      <Modal isOpen={c.modalActivo === 'cerrar'} onClose={c.cerrarModal} title="Cierre de Caja Diario">
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center">
            <span className="text-orange-800 font-medium">Efectivo Esperado en Gaveta:</span>
            <span className="text-2xl font-bold text-orange-600">{money(c.efectivoEsperado)}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Efectivo Físico Contado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
              <input
                type="number"
                value={c.efectivoFisico}
                onChange={(e) => c.setEfectivoFisico(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-500 transition-all"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          {c.efectivoFisico !== '' && (
            <div
              className={cn(
                'p-4 rounded-lg flex justify-between items-center border',
                c.diferencia === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200',
              )}
            >
              <span className={cn('font-medium', c.diferencia === 0 ? 'text-emerald-800' : 'text-rose-800')}>
                {c.diferencia === 0 ? 'Cuadre Exacto' : c.diferencia > 0 ? 'Sobrante:' : 'Faltante:'}
              </span>
              <span className={cn('text-xl font-bold', c.diferencia === 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {c.diferencia === 0 ? '$0' : money(Math.abs(c.diferencia))}
              </span>
            </div>
          )}

          <button
            disabled={c.saving || c.efectivoFisico === ''}
            onClick={c.handleCerrar}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Confirmar Cierre
          </button>
        </div>
      </Modal>
    </div>
  );
}

type Tone = 'slate' | 'emerald' | 'blue';
const TONE_STYLE: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
};

function SummaryCard({
  icon,
  tone,
  label,
  value,
}: {
  icon: ReactNode;
  tone: Tone;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', TONE_STYLE[tone])}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
