import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, Settings } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { ProductForm } from './components/ProductForm';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { deleteProductImage } from './lib/supabase';
import { Product, CartItem, OrderFormData } from './types';

function App() {
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const { products, categories, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { createOrder } = useOrders();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  const activeCategoryId = categories.find(c => c.name === activeCategory)?.id;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.categoria_id === activeCategoryId);

    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [products, activeCategoryId, searchTerm]);

  const addToCart = (product: Product) => {
    const categoryName = categories.find(c => c.id === product.categoria_id)?.name || '';
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      setCart(
        cart.map(item =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, cantidad: 1, categoria_name: categoryName }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map(item =>
          item.id === productId
            ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
            : item
        )
        .filter(item => item.cantidad > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleSubmitOrder = async (formData: OrderFormData) => {
    const orderData = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      tipo_entrega: formData.tipoEntrega,
      calle: formData.calle,
      numero_exterior: formData.numeroExterior,
      numero_interior: formData.numeroInterior,
      colonia: formData.colonia,
      ciudad: formData.ciudad,
      estado: formData.estado,
      codigo_postal: formData.codigoPostal,
      referencias: formData.referencias,
      total,
    };

    await createOrder(orderData, cart);
    setCart([]);
  };

  const handleAdminLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleLogout = async () => {
    await signOut();
    setShowAdmin(false);
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
  };

  const handleDeleteProduct = async (product: Product) => {
    if (product.imagen_url) {
      try {
        await deleteProductImage(product.imagen_url);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    await deleteProduct(product.id);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💎</div>
          <p className="text-xl text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No hay categorías disponibles</p>
        </div>
      </div>
    );
  }

  if (!activeCategory && categories.length > 0) {
    setActiveCategory(categories[0].name);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-purple-900">Perlas AC</h1>
            <p className="text-sm text-gray-600">Catálogo de Joyería</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdmin(true)}
              className="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700"
            >
              <Settings size={24} />
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap ${
                activeCategory === cat.name
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6">
        <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
      </div>

      {showCart && !showCheckout && (
        <Cart
          items={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {showCheckout && (
        <Checkout
          total={total}
          items={cart}
          onSubmit={handleSubmitOrder}
          onCancel={() => setShowCheckout(false)}
        />
      )}

      {showAdmin && !isAuthenticated && (
        <AdminLogin onClose={() => setShowAdmin(false)} onLogin={handleAdminLogin} />
      )}

      {showAdmin && isAuthenticated && (
        <AdminPanel
          products={products}
          categories={categories}
          onClose={() => setShowAdmin(false)}
          onLogout={handleLogout}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

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

export default App;
