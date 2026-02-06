import { X, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
    // Use primary image + gallery images
    const allImages = [
        ...(product.image_url ? [{ url: product.image_url, alt: product.name }] : []),
        ...(Array.isArray(product.images) ? product.images : [])
    ];

    // Dedup images by url just in case
    const uniqueImages = allImages.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm transition-colors"
                >
                    <X size={24} className="text-gray-500" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center overflow-y-auto">
                    {uniqueImages.length > 0 ? (
                        <div className="space-y-4 w-full">
                            {uniqueImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img.url}
                                    alt={img.alt || product.name}
                                    className={`w-full object-contain rounded-lg shadow-sm ${idx === 0 ? 'max-h-96' : 'max-h-48'}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-6xl">💎</div>
                    )}
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white flex flex-col h-full">
                    <div className="mb-6">
                        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                            {product.sku}
                        </span>
                        <h2 className="text-3xl font-serif text-gray-900 mt-2 mb-4">
                            {product.name}
                        </h2>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl font-bold text-amber-600">
                                ${product.retail_price.toLocaleString('es-MX')}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                    ${product.total_stock === 0 ? 'bg-red-100 text-red-800' :
                                    product.total_stock <= 5 ? 'bg-orange-100 text-orange-800 animate-pulse' :
                                        'bg-green-100 text-green-800'}`}>
                                {product.total_stock === 0 ? 'Agotado' :
                                    product.total_stock <= 5 ? `¡Solo quedan ${product.total_stock} piezas!` :
                                        'En Stock'}
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-stone max-w-none text-gray-600 mb-8 flex-grow">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Descripción</h3>
                        <p className="whitespace-pre-wrap">
                            {product.detailed_description || product.description || product.short_description || 'Sin descripción detallada.'}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            onAddToCart(product);
                            onClose();
                        }}
                        disabled={product.total_stock === 0}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                    >
                        <ShoppingCart size={20} />
                        {product.total_stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                    </button>
                </div>
            </div>
        </div>
    );
}
