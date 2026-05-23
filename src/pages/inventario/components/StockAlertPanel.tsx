import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Producto } from '@/types';

const formatCurrency = (v: number) => `$${Number(v || 0).toLocaleString('es-CL')}`;

interface StockAlertPanelProps {
  lowStockProducts: Producto[];
  criticalLowStockProducts: Producto[];
  warningLowStockProducts: Producto[];
  estimatedRestockCost: number;
  showOnlyLowStock: boolean;
  setShowOnlyLowStock: (fn: (prev: boolean) => boolean) => void;
}

export default function StockAlertPanel({
  lowStockProducts,
  criticalLowStockProducts,
  warningLowStockProducts,
  estimatedRestockCost,
  showOnlyLowStock,
  setShowOnlyLowStock,
}: StockAlertPanelProps) {
  if (lowStockProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200">
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">

        {/* Ícono + título */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">Alertas de stock</span>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Sin stock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
            <span className="text-2xl font-bold text-rose-700 leading-none">
              {criticalLowStockProducts.length}
            </span>
            <span className="text-xs text-rose-600 leading-tight">Sin<br />stock</span>
          </div>

          {/* Stock bajo */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-2xl font-bold text-amber-700 leading-none">
              {warningLowStockProducts.length}
            </span>
            <span className="text-xs text-amber-600 leading-tight">Stock<br />bajo</span>
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {/* Costo estimado */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Costo estimado reposición</span>
            <span className="text-lg font-bold text-slate-800">
              {formatCurrency(estimatedRestockCost)}
            </span>
          </div>
        </div>

        {/* Botón filtro */}
        <button
          type="button"
          onClick={() => setShowOnlyLowStock((prev) => !prev)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
            showOnlyLowStock
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          )}
        >
          {showOnlyLowStock ? 'Ver todos los productos' : 'Ver solo alertas'}
        </button>
      </div>
    </div>
  );
}