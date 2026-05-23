import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Receipt, Users, Truck, Wallet, FileBarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Inventario', href: '/inventario' },
  { icon: ShoppingCart, label: 'Punto de Venta', href: '/ventas' },
  { icon: Receipt, label: 'Historial de Ventas', href: '/historial' },
  { icon: Users, label: 'Clientes y Fiados', href: '/clientes' },
  { icon: Truck, label: 'Proveedores', href: '/proveedores' },
  { icon: Wallet, label: 'Caja', href: '/caja' },
  { icon: FileBarChart, label: 'Reportes', href: '/reportes' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-asr-primary-dark text-white flex flex-col transition-all duration-300 shadow-xl border-r border-asr-primary-dark">
      <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold text-xl tracking-tight bg-asr-primary">
        <span className="text-white mr-2">Ferretería</span><span className="text-white/90">ASR</span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-white/55 uppercase tracking-wider mb-4 px-3">
          Módulos
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-white text-asr-primary-dark font-semibold shadow-sm" 
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-asr-danger rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 mr-3 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 bg-asr-primary-dark">
        <button className="flex items-center w-full px-3 py-2.5 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Configuración
        </button>
      </div>
    </aside>
  );
}
