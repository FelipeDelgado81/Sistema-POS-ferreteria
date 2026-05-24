import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cliente } from '@/types';
import { useFiadosClienteQuery, useRegistrarAbono } from '@/hooks/queries/useFiadosQuery';
import Modal from '@/components/shared/Modal';

interface Props {
  cliente: Cliente;
  onClose: () => void;
}

const clp = (n: number) => `$${n.toLocaleString('es-CL')}`;
const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString('es-CL');

export default function FiadoDetalleModal({ cliente, onClose }: Props) {
  const { data: fiados = [], isLoading, error } = useFiadosClienteQuery(cliente.id);
  const abonarMutation = useRegistrarAbono(cliente.id);

  const [abonoFiadoId, setAbonoFiadoId] = useState<string | null>(null);
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');

  const pendientes = fiados.filter((f) => f.estado === 'pendiente');
  const saldoTotal = pendientes.reduce((sum, f) => sum + f.saldoPendiente, 0);

  const handleAbrirAbono = (fiadoId: string) => {
    setAbonoFiadoId(fiadoId);
    setMonto('');
    setNotas('');
  };

  const handleAbonar = async (e: { preventDefault(): void }, fiadoId: string, saldo: number) => {
    e.preventDefault();
    const value = Number(monto);
    if (!Number.isFinite(value) || value <= 0 || value > saldo) return;
    await abonarMutation.mutateAsync({ fiadoId, payload: { monto: value, notas: notas || undefined } });
    setAbonoFiadoId(null);
    setMonto('');
    setNotas('');
  };

  return (
    <Modal isOpen onClose={onClose} title={`Fiados · ${cliente.razonSocial}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-slate-500">Saldo pendiente total</span>
          <span
            className={cn(
              'text-lg font-bold',
              saldoTotal > 0 ? 'text-amber-600' : 'text-emerald-600',
            )}
          >
            {clp(saldoTotal)}
          </span>
        </div>

        {abonarMutation.error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {(abonarMutation.error as Error & { response?: { data?: { error?: string } } })
              ?.response?.data?.error || 'No se pudo registrar el abono'}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando fiados...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar fiados</span>
          </div>
        ) : fiados.length === 0 ? (
          <p className="py-12 text-center text-slate-400">Este cliente no tiene fiados registrados</p>
        ) : (
          <div className="space-y-3">
            {fiados.map((fiado) => {
              const pagado = fiado.estado === 'pagado';
              return (
                <div key={fiado.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {pagado ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="font-medium text-slate-800">
                          {fiado.montoOriginal != null ? clp(fiado.montoOriginal) : '—'}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                            pagado
                              ? 'bg-emerald-100 text-emerald-800'
                              : fiado.estado === 'anulado'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800',
                          )}
                        >
                          {fiado.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{fmtFecha(fiado.fecha)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Saldo</p>
                      <p
                        className={cn(
                          'font-semibold',
                          fiado.saldoPendiente > 0 ? 'text-amber-600' : 'text-emerald-600',
                        )}
                      >
                        {clp(fiado.saldoPendiente)}
                      </p>
                    </div>
                  </div>

                  {fiado.abonos.length > 0 && (
                    <ul className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-2">
                      {fiado.abonos.map((a) => (
                        <li key={a.id} className="flex justify-between gap-2">
                          <span>
                            {fmtFecha(a.fecha)}
                            {a.notas ? ` · ${a.notas}` : ''}
                          </span>
                          <span className="text-emerald-600 font-medium">{clp(a.monto)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {fiado.estado === 'pendiente' &&
                    (abonoFiadoId === fiado.id ? (
                      <form
                        onSubmit={(e) => handleAbonar(e, fiado.id, fiado.saldoPendiente)}
                        className="border-t border-slate-100 pt-3 space-y-2"
                      >
                        <input
                          type="number"
                          autoFocus
                          min={1}
                          max={fiado.saldoPendiente}
                          step="any"
                          placeholder={`Monto (máx ${clp(fiado.saldoPendiente)})`}
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          placeholder="Notas (opcional)"
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAbonoFiadoId(null)}
                            className="flex-1 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={
                              abonarMutation.isPending ||
                              !(Number(monto) > 0 && Number(monto) <= fiado.saldoPendiente)
                            }
                            className="flex-1 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {abonarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Registrar abono
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => handleAbrirAbono(fiado.id)}
                        className="w-full py-1.5 text-sm border border-orange-200 text-orange-700 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        Registrar abono
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
