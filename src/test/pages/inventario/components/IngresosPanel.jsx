import React from 'react';

const formatCurrency = (v) => `$${Number(v || 0).toLocaleString('es-CL')}`;

export default function IngresosPanel({ ingresos, onOpenIngreso }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Últimos ingresos</h2>
          <p className="text-sm text-slate-500">Compras registradas a proveedores y su impacto en stock.</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenIngreso()}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          Registrar ingreso
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {ingresos.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Aún no hay ingresos registrados.
          </div>
        ) : (
          ingresos.map((ingreso) => (
            <div
              key={ingreso.id}
              className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            >
              <div>
                <p className="font-medium text-slate-900">{ingreso.productName}</p>
                <p className="text-sm text-slate-500">
                  {ingreso.proveedorNombre}
                  {ingreso.invoiceNumber ? ` · Factura/OC ${ingreso.invoiceNumber}` : ''}
                </p>
                {ingreso.notes && (
                  <p className="text-xs text-slate-400 mt-1">{ingreso.notes}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  +{ingreso.quantity} unidades
                </span>
                <span className="text-slate-500">{ingreso.date}</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(ingreso.totalCost)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}