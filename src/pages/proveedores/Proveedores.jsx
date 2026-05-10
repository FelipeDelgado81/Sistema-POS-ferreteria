import React, { useState } from 'react';
import { Search, Plus, Truck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProveedores } from './hooks/useProveedores';

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar por RUT, Nombre o Categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Razón Social</th>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Deuda Actual</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProveedores.map((proveedor) => (
                <tr key={proveedor.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{proveedor.razonSocial}</td>
                  <td className="px-6 py-4 font-mono text-xs">{proveedor.rut}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {proveedor.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{proveedor.contacto}</span>
                      <span className="text-xs text-slate-400">{proveedor.telefono}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    ${proveedor.deuda.toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      proveedor.estado === 'Al día' ? "bg-emerald-100 text-emerald-800" : 
                      proveedor.estado === 'Por vencer' ? "bg-amber-100 text-amber-800" : 
                      "bg-rose-100 text-rose-800"
                    )}>
                      {proveedor.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors">
                      Ingresar Factura
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProveedores.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No se encontraron proveedores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}