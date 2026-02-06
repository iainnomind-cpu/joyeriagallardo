import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit, Trash2, Package, Diamond } from 'lucide-react';
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-amber-600 animate-pulse">
            <Diamond size={64} strokeWidth={1} />
          </div>
          <p className="text-xl text-stone-600 font-serif">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="bg-white shadow-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-stone-900 text-white p-2 rounded">
                <Diamond size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-stone-900 leading-none">Joyería Gallardo</h1>
                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Panel de Control</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {user && (
                <p className="text-sm text-stone-500">
                  <span className="opacity-50 mr-2">Sesión activa:</span>
                  <span className="font-medium text-stone-700">{user.email}</span>
                </p>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-2 rounded hover:bg-red-50 hover:text-red-600 font-medium transition-colors text-sm"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <CategoryManager />

          <div className="bg-white rounded border border-stone-200 shadow-sm p-6">
            <button
              onClick={handleAddProduct}
              className="bg-stone-900 text-white px-6 py-3 rounded flex items-center gap-2 font-medium hover:bg-stone-800 transition-all shadow hover:shadow-lg"
            >
              <Plus size={20} />
              Agregar Nuevo Producto
            </button>
          </div>
        </div>

        <div className="space-y-8 mt-8">
          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            return (
              <div key={category.id} className="bg-white rounded border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-stone-100 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Package className="text-stone-400" size={20} />
                    <h2 className="text-lg font-serif font-medium text-stone-800">{category.name}</h2>
                  </div>
                  <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-1 rounded-full">
                    {categoryProducts.length} producto{categoryProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-6">
                  {categoryProducts.length === 0 ? (
                    <p className="text-center text-stone-400 py-8 text-sm italic">
                      No hay productos en esta categoría
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="group bg-white rounded border border-stone-100 p-4 hover:border-amber-200 hover:shadow-md transition-all"
                        >
                          <div className="flex gap-4 mb-4">
                            <div className="w-20 h-20 bg-stone-50 rounded flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-100">
                              {product.imagen_url ? (
                                <img
                                  src={product.imagen_url}
                                  alt={product.codigo}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Diamond className="text-stone-200" size={24} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif font-medium text-stone-900 truncate">
                                {product.codigo}
                              </h4>
                              <p className="text-sm text-stone-500 line-clamp-2 mb-2 h-10">
                                {product.descripcion || 'Sin descripción'}
                              </p>
                              <p className="text-lg font-medium text-amber-700">
                                ${product.precio}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-stone-100 text-stone-700 py-2 rounded flex items-center justify-center gap-2 text-xs font-bold hover:bg-stone-200 transition-all uppercase tracking-wide"
                            >
                              <Edit size={14} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deleting === product.id}
                              className="flex-1 bg-white border border-red-100 text-red-600 py-2 rounded flex items-center justify-center gap-2 text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-all uppercase tracking-wide"
                            >
                              <Trash2 size={14} />
                              {deleting === product.id ? '...' : 'Eliminar'}
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

