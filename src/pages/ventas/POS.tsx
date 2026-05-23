import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Printer, CreditCard, Banknote, Percent, Usb, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import Modal from '@/components/shared/Modal';
import { PRODUCTOS_KEY, useProductosQuery } from '@/hooks/queries/useProductosQuery';
import { createVenta } from '@/services/ventasService';
import type { Producto, CartItem, MedioPago, DescuentoTipo } from '@/types';

export default function POS() {
  const qc = useQueryClient();
  const { data: allProductos = [], isLoading: loadingProductos, isError } = useProductosQuery();
  const productos = allProductos.filter((p) => p.active && p.stock > 0);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceType, setPriceType] = useState<'retail' | 'wholesale'>('retail');
  const [discount] = useState<{ type: DescuentoTipo; value: number }>({ type: 'none', value: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isError) setErrorMessage('Error al cargar productos');
  }, [isError]);

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const product = productos.find(
      (p) => p.code === searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (product) {
      addToCart(product);
      setSearchTerm('');
    } else {
      setErrorMessage('Producto no encontrado');
      setTimeout(() => setErrorMessage(''), 2500);
    }
  };

  const addToCart = (product: Producto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const stockUsed = existing.quantity + 1;
        if (stockUsed > product.stock) {
          setErrorMessage(`Stock insuficiente para "${product.name}"`);
          setTimeout(() => setErrorMessage(''), 2500);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const product = productos.find((p) => p.id === id);
    if (product && newQuantity > product.stock) {
      setErrorMessage(`Stock máximo disponible: ${product.stock}`);
      setTimeout(() => setErrorMessage(''), 2500);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = priceType === 'retail' ? item.priceRetail : item.priceWholesale;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount =
    discount.type === 'percent'
      ? subtotal * (discount.value / 100)
      : discount.type === 'fixed'
      ? discount.value
      : 0;

  const total = Math.max(0, subtotal - discountAmount);
  const receivedAmount = Number(cashReceived) || 0;
  const change = Math.max(0, receivedAmount - total);
  const isValidCash = receivedAmount >= total;

  const handleCheckoutClick = (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    if (method === 'cash') {
      setCashReceived('');
      setIsCashModalOpen(true);
    } else {
      processSale('tarjeta', null);
    }
  };

  const processSale = async (medioPago: MedioPago, montoRecibido: number | null) => {
    setProcessing(true);
    try {
      const items = cart.map((item) => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: priceType === 'retail' ? item.priceRetail : item.priceWholesale,
      }));

      await createVenta({
        items,
        medioPago,
        descuentoTipo: discount.type,
        descuentoValor: discount.value,
        montoRecibido: montoRecibido != null ? montoRecibido : undefined,
      });

      setCart([]);
      setIsCashModalOpen(false);
      setSuccessMessage(
        `Venta por $${total.toLocaleString('es-CL')} completada (${
          medioPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'
        }).`
      );
      setTimeout(() => setSuccessMessage(''), 3500);

      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? err.message)
        : 'Error al procesar la venta';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 relative">

      {successMessage && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-4 right-4 z-50 bg-rose-100 text-rose-800 border border-rose-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escanear código de barras o buscar producto (Enter para agregar)..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-lg font-medium"
            />
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-800">Búsqueda rápida</h2>
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setPriceType('retail')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  priceType === 'retail' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Detalle
              </button>
              <button
                onClick={() => setPriceType('wholesale')}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  priceType === 'wholesale' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Mayorista
              </button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto">
            {loadingProductos ? (
              <div className="col-span-full flex items-center justify-center py-16 text-slate-400">
                Cargando productos...
              </div>
            ) : productos.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-16 text-slate-400">
                No hay productos con stock disponible
              </div>
            ) : (
              productos.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-all text-center h-32 active:scale-95"
                >
                  <span className="font-medium text-slate-800 text-sm line-clamp-2 mb-2">{product.name}</span>
                  <span className="font-bold text-orange-600">
                    ${(priceType === 'retail' ? product.priceRetail : product.priceWholesale).toLocaleString('es-CL')}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Stock: {product.stock}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-100 xl:w-112.5 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            Carrito de Venta
          </div>
          {cart.length > 0 && (
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const itemPrice = priceType === 'retail' ? item.priceRetail : item.priceWholesale;
                return (
                  <div key={item.id} className="flex gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-sm truncate">{item.name}</h4>
                      <div className="text-orange-600 font-semibold text-sm mt-1">
                        ${itemPrice.toLocaleString('es-CL')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            {discount.value > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Descuento</span>
                <span>-${discountAmount.toLocaleString('es-CL')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-orange-600">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleCheckoutClick('cash')}
              disabled={cart.length === 0 || processing}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Banknote className="w-6 h-6" />
              Efectivo (F8)
            </button>
            <button
              onClick={() => handleCheckoutClick('card')}
              disabled={cart.length === 0 || processing}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-6 h-6" />
              Tarjeta (F9)
            </button>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              <Percent className="w-4 h-4" />
              Descuento
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              <Printer className="w-4 h-4" />
              Cotización
            </button>
            <button
              className="flex items-center justify-center p-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              title="Conectar Cajón/Impresora USB"
            >
              <Usb className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isCashModalOpen} onClose={() => setIsCashModalOpen(false)} title="Pago en Efectivo">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Total a Pagar</p>
            <p className="text-4xl font-bold text-slate-900">${total.toLocaleString('es-CL')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto Recibido</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
              <input
                autoFocus
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Vuelto</span>
              <span className={cn('text-2xl font-bold', receivedAmount >= total ? 'text-emerald-600' : 'text-rose-500')}>
                ${change.toLocaleString('es-CL')}
              </span>
            </div>
            {receivedAmount > 0 && receivedAmount < total && (
              <p className="text-xs font-medium text-rose-500 mt-2 text-right">
                Faltan ${(total - receivedAmount).toLocaleString('es-CL')}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsCashModalOpen(false)}
              className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => processSale('efectivo', receivedAmount)}
              disabled={!isValidCash || processing}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {processing ? 'Procesando...' : 'Confirmar Venta'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
