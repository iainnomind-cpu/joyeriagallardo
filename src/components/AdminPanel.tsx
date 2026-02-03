import { useState } from 'react';
import { X, Plus, Edit, Trash2, LogOut } from 'lucide-react';
import { Product, Category } from '../types';

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  onClose: () => void;
  onLogout: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => Promise<void>;
}

export function AdminPanel({
  products,
  categories,
  onClose,
  onLogout,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: AdminPanelProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar ${product.codigo}?`)) return;

    setDeleting(product.id);
    try {
      await onDeleteProduct(product);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    } finally {
      setDeleting(null);
    }
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.categoria_id === categoryId);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Panel de Administración</h2>
            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <LogOut size={20} />
                Salir
              </button>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <button
              onClick={onAddProduct}
              className="bg-green-600 text-white px-6 py-3 rounded-lg mb-6 flex items-center gap-2 font-bold hover:bg-green-700"
            >
              <Plus size={20} /> Nuevo Producto
            </button>
            {categories.map((category) => {
              const categoryProducts = getProductsByCategory(category.id);
              return (
                <div key={category.id} className="mb-8">
                  <h3 className="text-xl font-bold mb-4 border-b-2 border-purple-600 pb-2">
                    {category.name} ({categoryProducts.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-4 border-2">
                        <div className="flex gap-3 mb-3">
                          <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.imagen_url ? (
                              <img
                                src={product.imagen_url}
                                alt={product.codigo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">💎</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{product.codigo}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.descripcion || 'Sin descripción'}
                            </p>
                            <p className="text-lg font-bold text-purple-600">${product.precio}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-1 text-sm hover:bg-blue-700"
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="flex-1 bg-red-600 text-white py-2 rounded flex items-center justify-center gap-1 text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            {deleting === product.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
