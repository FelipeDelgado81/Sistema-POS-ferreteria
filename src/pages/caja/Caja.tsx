import React, { useState } from 'react';
import { Wallet, Banknote, CreditCard, ArrowDownCircle, ArrowUpCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/shared/Modal';

export default function Caja() {
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);
  const [efectivoFisico, setEfectivoFisico] = useState('');

  // Mock datos del día
  const cajaInicial = 50000;
  const ventasEfectivo = 145000;
  const ventasTarjeta = 210000;
  const entradas = 0;
  const salidas = 15000; // Pago proveedor de agua, por ejemplo
  
  const efectivoEsperado = cajaInicial + ventasEfectivo + entradas - salidas;
  const diferencia = Number(efectivoFisico) - efectivoEsperado;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Caja</h1>
          <p className="text-slate-500">Apertura, movimientos y cierre diario</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
            Ingreso
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <ArrowDownCircle className="w-4 h-4 text-rose-600" />
            Retiro
          </button>
          <button 
            onClick={() => setIsCerrarModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Cerrar Caja
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Fondo Fijo (Inicial)</p>
            <p className="text-xl font-bold text-slate-800">${cajaInicial.toLocaleString('es-CL')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Ventas en Efectivo</p>
            <p className="text-xl font-bold text-slate-800">${ventasEfectivo.toLocaleString('es-CL')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Ventas Tarjeta</p>
            <p className="text-xl font-bold text-slate-800">${ventasTarjeta.toLocaleString('es-CL')}</p>
          </div>
        </div>
        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-orange-600 font-medium">Efectivo Esperado</p>
            <p className="text-2xl font-bold text-orange-700">${efectivoEsperado.toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Movimientos del Día</h2>
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
              <tr>
                <td className="px-6 py-4">08:00</td>
                <td className="px-6 py-4"><span className="text-slate-600 font-medium">Apertura</span></td>
                <td className="px-6 py-4">Fondo Fijo Inicial</td>
                <td className="px-6 py-4 text-slate-700 font-medium">${cajaInicial.toLocaleString('es-CL')}</td>
                <td className="px-6 py-4">Admin</td>
              </tr>
              <tr>
                <td className="px-6 py-4">11:30</td>
                <td className="px-6 py-4"><span className="text-emerald-600 font-medium">Venta Efectivo</span></td>
                <td className="px-6 py-4">Boleta #00124</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">+ $45.000</td>
                <td className="px-6 py-4">Admin</td>
              </tr>
              <tr>
                <td className="px-6 py-4">12:15</td>
                <td className="px-6 py-4"><span className="text-rose-600 font-medium">Retiro</span></td>
                <td className="px-6 py-4">Pago a proveedor (Agua)</td>
                <td className="px-6 py-4 text-rose-600 font-medium">- $15.000</td>
                <td className="px-6 py-4">Admin</td>
              </tr>
              <tr>
                <td className="px-6 py-4">14:20</td>
                <td className="px-6 py-4"><span className="text-blue-600 font-medium">Venta Tarjeta</span></td>
                <td className="px-6 py-4">Boleta #00125</td>
                <td className="px-6 py-4 text-blue-600 font-medium">+ $210.000</td>
                <td className="px-6 py-4">Admin</td>
              </tr>
              <tr>
                <td className="px-6 py-4">16:45</td>
                <td className="px-6 py-4"><span className="text-emerald-600 font-medium">Venta Efectivo</span></td>
                <td className="px-6 py-4">Boleta #00126</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">+ $100.000</td>
                <td className="px-6 py-4">Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isCerrarModalOpen} 
        onClose={() => setIsCerrarModalOpen(false)} 
        title="Cierre de Caja Diario"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center">
            <span className="text-orange-800 font-medium">Efectivo Esperado en Gaveta:</span>
            <span className="text-2xl font-bold text-orange-600">${efectivoEsperado.toLocaleString('es-CL')}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Efectivo Físico Contado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
              <input 
                type="number"
                value={efectivoFisico}
                onChange={(e) => setEfectivoFisico(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-500 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {efectivoFisico !== '' && (
            <div className={cn(
              "p-4 rounded-lg flex justify-between items-center border",
              diferencia === 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
            )}>
              <span className={cn("font-medium", diferencia === 0 ? "text-emerald-800" : "text-rose-800")}>
                {diferencia === 0 ? "Cuadre Exacto" : (diferencia > 0 ? "Sobrante:" : "Faltante:")}
              </span>
              <span className={cn("text-xl font-bold", diferencia === 0 ? "text-emerald-600" : "text-rose-600")}>
                {diferencia === 0 ? "$0" : `$${Math.abs(diferencia).toLocaleString('es-CL')}`}
              </span>
            </div>
          )}

          <div className="pt-4">
            <button 
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
              onClick={() => {
                alert('Caja Cerrada Exitosamente. Imprimiendo Ticket de Cierre...');
                setIsCerrarModalOpen(false);
              }}
            >
              <Lock className="w-5 h-5" />
              Confirmar Cierre e Imprimir
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
