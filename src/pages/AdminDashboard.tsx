import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit, Trash2, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { ProductForm } from '../components/ProductForm';
import { CategoryManager } from '../components/CategoryManager';
import { deleteProductImage } from '../lib/supabase';
import { Product } from '../types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { products, categories, loading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('perlas-ac-updates');
    return () => channel.close();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-perlas-2024', { replace: true });
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (productData: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setShowProductForm(false);
    setEditingProduct(undefined);

    const channel = new BroadcastChannel('perlas-ac-updates');
    channel.postMessage({ type: 'product-updated' });
    channel.close();

    window.location.reload();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Eliminar ${product.codigo}?`)) return;

    setDeleting(product.id);
    try {
      if (product.imagen_url) {
        try {
          await deleteProductImage(product.imagen_url);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      await deleteProduct(product.id);

      const channel = new BroadcastChannel('perlas-ac-updates');
      channel.postMessage({ type: 'product-updated' });
      channel.close();

      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
      setDeleting(null);
    }
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.categoria_id === categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💎</div>
          <p className="text-xl text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="bg-white shadow-lg border-b-4 border-pink-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600 mt-1">Perlas AC - Gestión de Productos</p>
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Sesión activa: {user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-bold transition-all"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <CategoryManager />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-8 py-4 rounded-lg flex items-center gap-3 font-bold text-lg hover:bg-green-700 transition-all shadow-md"
            >
              <Plus size={24} />
              Agregar Nuevo Producto
            </button>
          </div>
        </div>

        <div className="space-y-8 mt-8">
          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-blue-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Package size={28} />
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-pink-100 text-sm">
                        {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {categoryProducts.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">
                      No hay productos en esta categoría
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border-2 border-gray-200 hover:border-pink-300 transition-all"
                        >
                          <div className="flex gap-4 mb-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.imagen_url ? (
                                <img
                                  src={product.imagen_url}
                                  alt={product.codigo}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl">💎</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-gray-900 truncate">
                                {product.codigo}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {product.descripcion || 'Sin descripción'}
                              </p>
                              <p className="text-2xl font-bold text-pink-600">
                                ${product.precio}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-700 transition-all"
                            >
                              <Edit size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deleting === product.id}
                              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                            >
                              <Trash2 size={16} />
                              {deleting === product.id ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
