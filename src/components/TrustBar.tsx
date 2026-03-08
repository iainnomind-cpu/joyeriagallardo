import { ShieldCheck, Package, Gem, Award } from 'lucide-react';

export function TrustBar() {
    const benefits = [
        {
            icon: <Award className="text-amber-600" size={32} />,
            title: "Artesanal Nacional",
            desc: "Joyería hecha en México"
        },
        {
            icon: <Package className="text-amber-600" size={32} />,
            title: "Mayoreo desde 3 Pzas",
            desc: "Precios especiales al mayoreo"
        },
        {
            icon: <ShieldCheck className="text-amber-600" size={32} />,
            title: "Garantía Respaldada",
            desc: "Seguimiento post-compra"
        },
        {
            icon: <Gem className="text-amber-600" size={32} />,
            title: "Baño de Oro Propio",
            desc: "Chapa de oro 14K y Plata"
        }
    ];

    return (
        <div className="bg-stone-50 border-y border-stone-100 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {benefits.map((b, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-4 hover:bg-white hover:shadow-md rounded-xl transition-all cursor-default">
                            <div className="mb-4 p-3 bg-amber-50 rounded-full">
                                {b.icon}
                            </div>
                            <h3 className="font-serif font-bold text-stone-900 mb-1">{b.title}</h3>
                            <p className="text-sm text-stone-500">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
