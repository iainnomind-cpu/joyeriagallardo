import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl">No hay productos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer group"
          onClick={() => onProductClick(product)}
        >
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 aspect-[4/3] sm:h-40 flex items-center justify-center overflow-hidden relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-4xl sm:text-5xl">💎</div>
            )}

            {/* Stock Badge */}
            {product.total_stock <= 5 && (
              <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-bold shadow-sm 
                    ${product.total_stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white animate-pulse'}`}>
                {product.total_stock === 0 ? 'AGOTADO' : 'POCAS PIEZAS'}
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4 flex flex-col h-full">
            {/* Swapped: Name is now prominent, SKU is implicit or small */}
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 leading-tight line-clamp-1">
              {product.name || product.sku}
            </h3>

            {/* Short Description */}
            <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2 h-7 sm:h-8">
              {product.short_description || `SKU: ${product.sku}`}
            </p>

            <p className="text-lg sm:text-xl font-bold text-amber-600 mb-3 mt-auto">${product.retail_price.toLocaleString('es-MX')}</p>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening modal when clicking add
                onAddToCart(product);
              }}
              className="w-full bg-stone-900 text-white py-2 rounded-lg hover:bg-stone-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors"
            >
              <Plus size={16} /> Agregar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
