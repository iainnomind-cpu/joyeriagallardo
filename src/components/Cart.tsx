import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function Cart({ items, onClose, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.retail_price * item.cantidad, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white text-stone-900 p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold">Tu Bolsa</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart size={32} className="text-stone-300" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-2">Tu bolsa está vacía</h3>
                <p className="text-stone-500 text-sm mb-8">Descubre nuestra colección exclusiva y encuentra la pieza perfecta.</p>
                <button onClick={onClose} className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-stone-800 transition-all">
                  Explorar Colección
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Image Placeholder */}
                  <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">💎</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight">{item.name || item.sku}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-wide mt-1">{item.categoria_name}</p>
                      </div>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-stone-200 rounded-full px-2 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-serif font-bold text-stone-900 text-lg">${(item.retail_price * item.cantidad).toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-6 bg-stone-50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-stone-500 font-medium">Subtotal</span>
              <span className="text-3xl font-serif font-bold text-stone-900">${total.toLocaleString('es-MX')}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={onCheckout}
                className="w-full bg-stone-900 text-white py-4 rounded-full hover:bg-stone-800 font-bold tracking-wide transition-all shadow-lg shadow-stone-900/10"
              >
                PROCEDER AL PAGO
              </button>

              <button
                onClick={onClose}
                className="w-full bg-white border border-stone-200 text-stone-600 py-3 rounded-full hover:border-stone-400 hover:text-stone-900 font-medium transition-all"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
