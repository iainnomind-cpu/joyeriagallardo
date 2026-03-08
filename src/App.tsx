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
import { ProductDetailModal } from './components/ProductDetailModal';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { Footer } from './components/Footer';
import { deleteProductImage } from './lib/supabase';
import { Product, CartItem, OrderFormData } from './types';

function App() {
  const { signIn, signOut, isAuthenticated } = useAuth();
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
  const [detailedProduct, setDetailedProduct] = useState<Product | undefined>();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  const activeCategoryId = categories.find(c => c.name === activeCategory)?.id;

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.category_id === activeCategoryId);

    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [products, activeCategoryId, searchTerm]);

  const addToCart = (product: Product) => {
    const categoryName = categories.find(c => c.id === product.category_id)?.name || '';
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
    setShowCart(true); // Open cart immediately for feedback
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

  const total = cart.reduce((sum, item) => sum + item.retail_price * item.cantidad, 0);

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

  // ... Admin handlers (same as before)
  const handleAdminLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      throw error;
    }
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
    if (product.image_url) {
      try {
        await deleteProductImage(product.image_url);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    await deleteProduct(product.id);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-amber-600 animate-pulse">
            <img src="/logo.png" alt="Joyería Gallardo" className="h-16 w-16 object-contain" />
          </div>
          <p className="text-xl text-stone-600 font-serif">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  // Navbar Component (Inline for simple state access)
  const Navbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/60 backdrop-blur-xl shadow-lg border-b border-white/30 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Joyería Gallardo" className={`h-20 w-20 object-contain transition-all ${isScrolled ? 'brightness-0' : ''}`} />
          <div>
            <h1 className={`text-lg font-serif font-bold ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
              Joyería Gallardo
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Admin Trigger (Secret) */}
          <button
            onClick={() => setShowAdmin(true)}
            className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-stone-400 hover:text-stone-800' : 'text-white/70 hover:text-white'}`}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => setShowCart(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-stone-900 hover:bg-stone-100'}`}
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">Carrito</span>
            {cart.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 selection:bg-amber-100">

      <Navbar />

      <Hero />

      <TrustBar />

      <main id="collection" className="max-w-7xl mx-auto px-4 py-16">

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-amber-600 font-medium tracking-widest uppercase text-xs mb-2 block">Explora nuestra</span>
          <h2 className="text-4xl font-serif font-bold text-stone-900">Colección Exclusiva</h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Controls: Category & Search */}
        <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm py-4 mb-8 border-b border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between transition-all">

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat.name
                  ? 'bg-stone-900 text-white border-stone-900 shadow-lg transform scale-105'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar joya..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="min-h-[400px]">
          <ProductGrid
            products={filteredProducts}
            onAddToCart={addToCart}
            onProductClick={setDetailedProduct}
          />
        </div>

      </main>

      <Footer />

      {/* Modals & Overlays */}
      {showCart && (
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

      {detailedProduct && (
        <ProductDetailModal
          product={detailedProduct}
          onClose={() => setDetailedProduct(undefined)}
          onAddToCart={addToCart}
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
