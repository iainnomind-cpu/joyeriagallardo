import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl">No hay productos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all"
        >
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-40 flex items-center justify-center overflow-hidden">
            {product.imagen_url ? (
              <img
                src={product.imagen_url}
                alt={product.codigo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-5xl">💎</div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-1">{product.codigo}</h3>
            {product.descripcion && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.descripcion}</p>
            )}
            <p className="text-2xl font-bold text-purple-600 mb-3">${product.precio}</p>
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold"
            >
              <Plus size={18} /> Agregar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
