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
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={64} className="mx-auto mb-4 opacity-30" />
              <p>Carrito vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{item.codigo}</h3>
                      <p className="text-sm text-gray-500">{item.categoria_name}</p>
                      {item.descripcion && (
                        <p className="text-xs text-gray-600 mt-1">{item.descripcion}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.cantidad}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-purple-600">${item.precio * item.cantidad}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-3xl font-bold text-purple-600">${total}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 font-bold"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
