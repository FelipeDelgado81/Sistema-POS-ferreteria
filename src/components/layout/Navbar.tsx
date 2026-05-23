import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-asr-surface border-b border-asr-border flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-asr-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-asr-border rounded-lg leading-5 bg-asr-background placeholder-asr-muted focus:outline-none focus:bg-white focus:ring-2 focus:ring-asr-primary focus:border-asr-primary sm:text-sm transition-colors"
            placeholder="Buscar productos, clientes o ventas (F3)..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-asr-muted hover:text-asr-primary transition-colors rounded-full hover:bg-asr-background">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-asr-danger ring-2 ring-white"></span>
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-asr-border">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-asr-text">{user?.name || 'Admin'}</div>
            <div className="text-xs text-asr-muted">Caja 01</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
            <User className="h-5 w-5 text-asr-primary" />
          </div>
          <button 
            onClick={logout}
            className="p-2 text-asr-muted hover:text-asr-danger transition-colors rounded-full hover:bg-red-50 ml-2"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
