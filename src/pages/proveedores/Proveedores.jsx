import React, { useState } from 'react';
import { Plus, Truck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useProveedores } from './hooks/useProveedores';
import ProveedoresTable from './components/ProveedoresTable';

export default function Proveedores() {
  const { proveedores, totalDeuda, proveedoresVencidos } = useProveedores();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProveedores = proveedores.filter(p => 
    p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.rut.includes(searchTerm) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-500">Gestiona tus distribuidores y órdenes de compra</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Exportar Deudas
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-orange-600/20">
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Proveedores</p>
            <p className="text-2xl font-bold text-slate-800">{proveedores.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Deuda Total</p>
            <p className="text-2xl font-bold text-slate-800">${totalDeuda.toLocaleString('es-CL')}</p>
            {proveedoresVencidos > 0 && (
              <p className="text-xs text-rose-500 font-medium mt-0.5">
                {proveedoresVencidos} con deuda vencida
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Al día</p>
            <p className="text-2xl font-bold text-slate-800">
              {proveedores.filter(p => p.estado === 'Al día').length}
            </p>
          </div>
        </div>
      </div>

      <ProveedoresTable
        proveedores={filteredProveedores}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}