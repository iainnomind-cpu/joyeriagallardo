import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <div className="relative h-[50vh] min-h-[400px] w-full bg-stone-900 overflow-hidden">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent"></div>

            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-start text-white pt-20">
                <span className="text-amber-400 font-medium tracking-[0.2em] uppercase text-xs mb-2 animate-fade-in-up">
                    Chapa de Oro 14K y Plata Nacional
                </span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight max-w-3xl animate-fade-in-up delay-100">
                    Joyería Artesanal<br />
                    Nacional
                </h1>
                <p className="text-stone-300 text-sm md:text-lg max-w-xl mb-6 font-light leading-relaxed animate-fade-in-up delay-200 block">
                    Precios de mayoreo a partir de 3 piezas. Calidad garantizada con respaldo y seguimiento.
                </p>

                <button
                    onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group bg-white text-stone-900 px-6 py-3 rounded-full font-medium hover:bg-amber-50 transition-all flex items-center gap-2 animate-fade-in-up delay-300 hover:shadow-lg hover:shadow-white/20 text-sm"
                >
                    Ver Productos
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </button>
            </div>
        </div>
    );
}
