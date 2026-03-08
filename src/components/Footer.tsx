import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-400 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="Joyería Gallardo" className="h-20 w-20 object-contain" />
                            <h3 className="text-xl font-serif text-white">Joyería Gallardo</h3>
                        </div>
                        <p className="leading-relaxed mb-6">
                            Joyería en chapa de oro de 14k Nacional y Plata Nacional.
                            Calidad artesanal, garantía y respaldo en cada pieza.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/share/1CTCwZagsp/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-500 transition-colors"><Facebook /></a>
                            <a href="https://www.instagram.com/joyasgallardo?igsh=N3dkend1emo2NTNn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-500 transition-colors"><Instagram /></a>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Información</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Clock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <span className="text-white text-sm font-medium">Horario</span>
                                    <p className="text-sm">Lun – Vie: 9:00 AM – 6:00 PM</p>
                                    <p className="text-sm">Sábados: 9:00 AM – 3:00 PM</p>
                                </div>
                            </li>
                            <li className="mt-4">
                                <span className="text-white text-sm font-medium">Compras de Mayoreo</span>
                                <p className="text-sm">A partir de 3 piezas ya cuentas con precio de mayoreo.</p>
                            </li>
                            <li className="mt-4">
                                <span className="text-white text-sm font-medium">Garantía</span>
                                <p className="text-sm">Garantizamos la mercancía. Joyería artesanal nacional con baño de oro. Te respaldamos con seguimiento después de tu compra.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Contacto</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-amber-500 shrink-0" size={20} />
                                <span>Paseo del Hospicio #65,<br />Locales A, B.<br />Guadalajara Centro</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-amber-500 shrink-0" size={20} />
                                <div>
                                    <a href="tel:3330437902" className="hover:text-white transition-colors block">33 3043 7902</a>
                                    <a href="tel:3320573191" className="hover:text-white transition-colors block">33 2057 3191</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="text-amber-500 shrink-0" size={20} />
                                <a href="mailto:gallardojoyasmx@gmail.com" className="hover:text-white transition-colors">gallardojoyasmx@gmail.com</a>
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
