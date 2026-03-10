import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { ProductGrid } from '../components/ProductGrid';
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { Footer } from '../components/Footer';
import { Product, CartItem, OrderFormData } from '../types';

export function Storefront() {
  const navigate = useNavigate();
  const { products, categories, loading: productsLoading } = useProducts();
  const { createOrder } = useOrders();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState<Product | undefined>();
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    const channel = new BroadcastChannel('perlas-ac-updates');
    channel.onmessage = (event) => {
      if (event.data.type === 'product-updated' || event.data.type === 'category-updated') {
        window.location.reload();
      }
    };
    return () => channel.close();
  }, []);

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
    setShowCart(true);
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
    // 1. Format Address
    const addressString = formData.tipoEntrega === 'envio'
      ? `${formData.calle} ${formData.numeroExterior ? '#' + formData.numeroExterior : ''} ${formData.numeroInterior ? 'Int. ' + formData.numeroInterior : ''}, Col. ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, CP ${formData.codigoPostal}. Ref: ${formData.referencias || 'Ninguna'}`.replace(/ +/g, ' ').replace(/ ,/g, ',')
      : 'Recoger en Tienda';

    // 2. Format Notes with Contact Info
    const notesString = `Cliente: ${formData.nombre}\nTel: ${formData.telefono}\n${formData.referencias ? `Notas: ${formData.referencias}` : ''}`;

    // 3. Prepare Payload
    const orderData = {
      sale_channel: 'online' as const,
      delivery_method: (formData.tipoEntrega === 'envio' ? 'shipping' : 'pickup') as 'shipping' | 'pickup',
      delivery_address: addressString,
      notes: notesString,
      total,
    };

    const customerData = {
      name: formData.nombre,
      phone: formData.telefono
    };

    try {
      const order = await createOrder(orderData, cart, customerData);
      setCart([]);
      return order;
    } catch (err) {
      console.error(err);
      alert('Hubo un error al procesar tu pedido. Intenta nuevamente.');
      throw err;
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-amber-600 animate-pulse">
            <img src="/logo.png" alt="Joyería Gallardo" className="h-16 w-16 object-contain" />
          </div>
          <p className="text-xl text-stone-600 font-serif tracking-wide">Cargando colección...</p>
        </div>
      </div>
    );
  }

  // Navbar Component
  const Navbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/60 backdrop-blur-xl shadow-lg border-b border-white/30 py-3' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-y-3 gap-x-4">

        {/* Logo */}
        <div className="flex items-center gap-2 order-1">
          <img src="/logo.png" alt="Joyería Gallardo" className={`h-20 w-20 object-contain transition-all ${isScrolled ? 'brightness-0' : ''}`} />
          <div>
            <h1 className={`text-base md:text-lg font-serif font-bold ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
              Joyería Gallardo
            </h1>
          </div>
        </div>

        {/* Search Bar - Compact & Right-aligned */}
        <div className={`relative order-3 md:order-2 w-full md:w-64 md:ml-auto md:mr-6 transition-all ${isScrolled ? 'opacity-100' : 'opacity-90'}`}>
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isScrolled ? 'text-stone-400' : 'text-stone-500'}`} size={16} />
          <input
            type="text"
            placeholder="Buscar joya..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 rounded-full border focus:outline-none focus:ring-1 transition-all text-xs ${isScrolled
              ? 'bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500'
              : 'bg-white/90 border-transparent focus:bg-white text-stone-900 placeholder:text-stone-500 shadow-sm'
              }`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 order-2 md:order-3">
          <button
            onClick={() => setShowCart(true)}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-stone-900 hover:bg-stone-100'}`}
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

      <main id="collection" className="max-w-7xl mx-auto px-4 py-8">

        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="text-amber-600 font-medium tracking-widest uppercase text-xs mb-1 block">Explora nuestra</span>
          <h2 className="text-3xl font-serif font-bold text-stone-900">Colección Exclusiva</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Categories - Centered */}
        <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-sm py-3 mb-6 border-b border-stone-100 flex justify-center transition-all shadow-sm">
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar px-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat.name
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800'
                  }`}
              >
                {cat.name}
              </button>
            ))}
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

      <TrustBar />

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
    </div>
  );
}
