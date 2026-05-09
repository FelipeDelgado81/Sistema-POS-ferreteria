import React from 'react';
import { AlertTriangle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (v) => `$${Number(v || 0).toLocaleString('es-CL')}`;

export default function StockAlertPanel({
  lowStockProducts,
  criticalLowStockProducts,
  warningLowStockProducts,
  visibleLowStockProducts,
  stockAlertFilter,
  setStockAlertFilter,
  showOnlyLowStock,
  setShowOnlyLowStock,
  totalMissingUnits,
  estimatedRestockCost,
  onIngreso,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Alertas de stock bajo</h2>
            <p className="text-sm text-slate-600">
              Productos que alcanzaron o bajaron de su stock mínimo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-800 font-medium">
            {lowStockProducts.length} alertas activas
          </span>
          {lowStockProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOnlyLowStock((prev) => !prev)}
              className={cn(
                'px-3 py-1 rounded-full border font-medium transition-colors',
                showOnlyLowStock
                  ? 'border-amber-300 bg-amber-100 text-amber-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {showOnlyLowStock ? 'Mostrar toda la tabla' : 'Ver solo alertas en tabla'}
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* resumen y filtros solo si hay alertas */}
        {lowStockProducts.length > 0 && (
          <div className="p-4 bg-slate-50/60 border-b border-slate-200 space-y-4">
            {/* Tarjetas crítico / preventivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-medium text-rose-700">Críticos sin stock</p>
                <p className="text-2xl font-bold text-rose-900">{criticalLowStockProducts.length}</p>
                <p className="text-xs text-rose-700 mt-1">Requieren reposición inmediata.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-700">Alertas preventivas</p>
                <p className="text-2xl font-bold text-amber-900">{warningLowStockProducts.length}</p>
                <p className="text-xs text-amber-700 mt-1">Stock disponible pero bajo el mínimo.</p>
              </div>
            </div>

            {/* pills de filtro */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all',      label: `Todas (${lowStockProducts.length})`,          active: 'border-slate-900 bg-slate-900 text-white',     inactive: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50' },
                { key: 'critical', label: `Críticas (${criticalLowStockProducts.length})`, active: 'border-rose-700 bg-rose-700 text-white',       inactive: 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50' },
                { key: 'warning',  label: `Preventivas (${warningLowStockProducts.length})`, active: 'border-amber-600 bg-amber-600 text-white', inactive: 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50' },
              ].map(({ key, label, active, inactive }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStockAlertFilter(key)}
                  className={cn('px-3 py-1 rounded-full border text-sm font-medium transition-colors', stockAlertFilter === key ? active : inactive)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* totales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-medium text-slate-500">Unidades por reponer</p>
                <p className="text-2xl font-bold text-slate-900">{totalMissingUnits}</p>
                <p className="text-xs text-slate-500 mt-1">Según el filtro activo.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-medium text-slate-500">Costo estimado de reposición</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(estimatedRestockCost)}</p>
                <p className="text-xs text-slate-500 mt-1">Calculado con precio de compra actual.</p>
              </div>
            </div>
          </div>
        )}

        {/* lista de productos */}
        {lowStockProducts.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No hay productos con stock bajo en este momento.
          </div>
        ) : visibleLowStockProducts.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No hay alertas para ese filtro.
          </div>
        ) : (
          visibleLowStockProducts.map((product) => {
            const faltante   = Math.max(product.minStock - product.stock, 0);
            const isCritical = product.stock === 0;
            return (
              <div
                key={product.id}
                className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Código: {product.code} · Mínimo: {product.minStock} · Disponible: {product.stock}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn('px-3 py-1 rounded-full text-sm font-medium', isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}>
                    {isCritical ? 'Sin stock' : 'Stock bajo'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    Faltan {faltante} unidades
                  </span>
                  <button
                    type="button"
                    onClick={() => onIngreso(product)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    Reponer stock
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}