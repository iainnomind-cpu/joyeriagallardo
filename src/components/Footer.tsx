import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-400 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-serif text-white mb-6">Joyería Gallardo</h3>
                        <p className="leading-relaxed mb-6">
                            Creando momentos inolvidables a través de la joyería fina desde 1990.
                            Calidad, confianza y distinción en cada pieza.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-white hover:text-amber-500 transition-colors"><Facebook /></a>
                            <a href="#" className="text-white hover:text-amber-500 transition-colors"><Instagram /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Enlaces Rápidos</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">Colecciones</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Guía de Tallas</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Política de Envíos</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Contacto</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-amber-500 shrink-0" size={20} />
                                <span>Pedro Moreno 123, Col. Centro<br />Guadalajara, Jal.</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-amber-500 shrink-0" size={20} />
                                <span>(33) 1234 5678</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="text-amber-500 shrink-0" size={20} />
                                <span>contacto@joyeriagallardo.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-800 mt-12 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Joyería Gallardo. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
