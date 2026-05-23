import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Truck, Wallet, FileBarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Inventario', href: '/inventario' },
  { icon: ShoppingCart, label: 'Punto de Venta', href: '/ventas' },
  { icon: Users, label: 'Clientes y Fiados', href: '/clientes' },
  { icon: Truck, label: 'Proveedores', href: '/proveedores' },
  { icon: Wallet, label: 'Caja', href: '/caja' },
  { icon: FileBarChart, label: 'Reportes', href: '/reportes' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 shadow-xl border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl tracking-tight bg-slate-950/50">
        <span className="text-orange-500 mr-2">Ferretería</span>ASR
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
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
                  ? "bg-orange-500/10 text-orange-400 font-medium" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 mr-3 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button className="flex items-center w-full px-3 py-2.5 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Configuración
        </button>
      </div>
    </aside>
  );
}
