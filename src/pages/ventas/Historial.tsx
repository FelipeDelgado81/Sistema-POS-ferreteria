import { Receipt, Eye, Ban, Banknote, CreditCard, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { MedioPago, VentaEstado } from '@/types';
import { useHistorialVentas } from './hooks/useHistorialVentas';

const money = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const MEDIO_LABEL: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  fiado: 'Fiado',
};

function MedioBadge({ medio }: { medio: MedioPago }) {
  const icon =
    medio === 'tarjeta' ? <CreditCard className="w-3.5 h-3.5" /> : medio === 'fiado' ? <Clock className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />;
  const style =
    medio === 'tarjeta'
      ? 'bg-blue-50 text-blue-700'
      : medio === 'fiado'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', style)}>
      {icon}
      {MEDIO_LABEL[medio]}
    </span>
  );
}

function EstadoBadge({ estado }: { estado: VentaEstado }) {
  if (estado === 'anulada') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700">
        <XCircle className="w-3.5 h-3.5" />
        Anulada
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      Completada
    </span>
  );
}

export default function Historial() {
  const h = useHistorialVentas();
  const venta = h.detalle.data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de Ventas</h1>
          <p className="text-slate-500">Consulta, revisa el detalle y anula ventas</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Total del período</p>
          <p className="text-xl font-bold text-slate-800">{money(h.totalPeriodo)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
          <input
            type="date"
            value={h.filtros.desde || ''}
            onChange={(e) => h.setFiltro('desde', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
          <input
            type="date"
            value={h.filtros.hasta || ''}
            onChange={(e) => h.setFiltro('hasta', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Medio de pago</label>
          <select
            value={h.filtros.medioPago || ''}
            onChange={(e) => h.setFiltro('medioPago', e.target.value as MedioPago | '')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="fiado">Fiado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
          <select
            value={h.filtros.estado || ''}
            onChange={(e) => h.setFiltro('estado', e.target.value as VentaEstado | '')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
          >
            <option value="">Todos</option>
            <option value="completada">Completada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
        <button
          onClick={h.limpiarFiltros}
          className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Medio</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {h.loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Cargando ventas…
                  </td>
                </tr>
              )}
              {h.isError && !h.loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-rose-600">
                    No se pudieron cargar las ventas.
                  </td>
                </tr>
              )}
              {!h.loading && !h.isError && h.ventas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No se encontraron ventas con esos filtros.
                  </td>
                </tr>
              )}
              {h.ventas.map((v) => (
                <tr key={v.id} className={cn(v.estado === 'anulada' && 'bg-rose-50/40 text-slate-400')}>
                  <td className="px-6 py-4 whitespace-nowrap">{fechaHora(v.fecha)}</td>
                  <td className="px-6 py-4">{v.clienteNombre || 'Sin cliente'}</td>
                  <td className="px-6 py-4"><MedioBadge medio={v.medioPago} /></td>
                  <td className="px-6 py-4"><EstadoBadge estado={v.estado} /></td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800">{money(v.total)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => h.setSelectedId(v.id)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {v.estado === 'completada' && (
                        <button
                          onClick={() => h.setVentaAAnular(v.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Anular venta"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle */}
      <Modal isOpen={h.selectedId !== null} onClose={() => h.setSelectedId(null)} title="Detalle de Venta">
        {h.detalle.isLoading && <p className="text-slate-500 py-6 text-center">Cargando detalle…</p>}
        {venta && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-slate-500">Fecha</p>
                <p className="font-medium text-slate-800">{fechaHora(venta.fecha)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Estado</p>
                <EstadoBadge estado={venta.estado} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-slate-500">Cliente</p>
                <p className="font-medium text-slate-800">{venta.clienteNombre || 'Sin cliente'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Medio de pago</p>
                <MedioBadge medio={venta.medioPago} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {venta.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700">{it.productoNombre}</td>
                      <td className="px-3 py-2 text-center">{it.cantidad}</td>
                      <td className="px-3 py-2 text-right">{money(it.precioUnitario)}</td>
                      <td className="px-3 py-2 text-right font-medium">{money(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{money(venta.subtotal)}</span>
              </div>
              {venta.descuentoMonto > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Descuento</span>
                  <span>- {money(venta.descuentoMonto)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-1">
                <span>Total</span>
                <span>{money(venta.total)}</span>
              </div>
              {venta.medioPago === 'efectivo' && venta.montoRecibido != null && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Recibido</span>
                    <span>{money(venta.montoRecibido)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Vuelto</span>
                    <span>{money(venta.vuelto ?? 0)}</span>
                  </div>
                </>
              )}
            </div>

            {venta.estado === 'completada' && (
              <button
                onClick={() => h.setVentaAAnular(venta.id)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Anular Venta
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={h.ventaAAnular !== null}
        onClose={() => h.setVentaAAnular(null)}
        onConfirm={h.handleAnular}
        title="Anular venta"
        message="Esta acción repondrá el stock de los productos y marcará la venta como anulada. ¿Continuar?"
        confirmText="Anular"
      />
    </div>
  );
}
