import { useState, useEffect } from 'react';
import { User, Home, Store, CheckCircle, ArrowLeft, ShieldCheck, Copy, Info } from 'lucide-react';
import { OrderFormData, CartItem } from '../types';
import { useOrders } from '../hooks/useOrders';

interface CheckoutProps {
  total: number;
  items: CartItem[];
  onSubmit: (formData: OrderFormData) => Promise<any>;
  onCancel: () => void;
}

export function Checkout({ total, items, onSubmit, onCancel }: CheckoutProps) {
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    nombre: '',
    telefono: '',
    tipoEntrega: 'recoger',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    referencias: '',
  });
  const { getBankDetails } = useOrders();

  useEffect(() => {
    getBankDetails().then(details => setBankDetails(details));
  }, []);

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      alert('Por favor completa nombre y teléfono');
      return;
    }

    if (formData.tipoEntrega === 'envio') {
      if (!formData.calle || !formData.colonia || !formData.ciudad || !formData.estado || !formData.codigoPostal) {
        alert('Por favor completa todos los campos de dirección');
        return;
      }
    }

    setSubmitting(true);
    try {
      const order = await onSubmit(formData);
      setCompletedOrder(order);
      setOrderComplete(true);

      if (formData.tipoEntrega !== 'envio') {
        setTimeout(() => {
          onCancel();
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    if (formData.tipoEntrega === 'envio') {
      return (
        <div className="fixed inset-0 bg-stone-900/90 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">Ficha de Pago</h2>
                <p className="text-stone-500">Transfiere el monto total para procesar tu pedido.</p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {completedOrder?.order_number}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1">Total a transferir</p>
                    <p className="text-3xl font-serif font-bold text-stone-900">${(completedOrder?.total || total).toLocaleString('es-MX')}</p>
                  </div>

                  <div className="h-px bg-stone-200 my-4"></div>

                  {bankDetails ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1">Banco</p>
                          <p className="font-medium text-stone-900">{bankDetails.bank}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1">Titular</p>
                          <p className="font-medium text-stone-900">{bankDetails.accountHolder}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1 flex items-center justify-between">
                          CLABE Interbancaria
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(bankDetails.clabe);
                              alert('CLABE copiada al portapapeles');
                            }}
                            className="text-blue-600 hover:text-blue-800 normal-case flex items-center gap-1"
                          >
                            <Copy size={12} /> Copiar
                          </button>
                        </p>
                        <p className="font-mono text-lg text-stone-900 tracking-wider bg-white p-2 border rounded-lg text-center mt-1">
                          {bankDetails.clabe}
                        </p>
                      </div>

                      {bankDetails.cardNumber && (
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1 flex items-center justify-between">
                            Número de Tarjeta
                          </p>
                          <p className="font-mono text-lg text-stone-900 tracking-wider bg-white p-2 border rounded-lg text-center mt-1">
                            {bankDetails.cardNumber}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide font-bold mb-1 flex items-center justify-between">
                          Concepto de Pago (IMPORTANTE)
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(completedOrder?.order_number || '');
                              alert('Concepto copiado al portapapeles');
                            }}
                            className="text-blue-600 hover:text-blue-800 normal-case flex items-center gap-1"
                          >
                            <Copy size={12} /> Copiar
                          </button>
                        </p>
                        <p className="font-mono text-lg text-amber-700 font-bold tracking-wider bg-amber-50 p-2 border border-amber-200 rounded-lg text-center mt-1">
                          {completedOrder?.order_number}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-stone-500 text-center py-4">No hay datos bancarios configurados. Por favor contacta al soporte.</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-8 flex items-start gap-3">
                <Info className="shrink-0 mt-0.5" size={18} />
                <p>
                  {bankDetails?.instructions || 'Una vez realizada la transferencia, tu pedido será preparado y enviado.'}
                  <br /><br /><strong>Asegúrate de copiar tu concepto de pago.</strong>
                </p>
              </div>

              <button onClick={onCancel} className="w-full bg-stone-900 text-white py-4 rounded-full font-bold hover:bg-stone-800 transition-all text-lg shadow-lg">
                Entendido, volver a la tienda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-stone-900/90 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          <div className="p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-50 p-4 rounded-full">
                <CheckCircle size={64} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">¡Pedido Confirmado!</h2>
            <p className="text-stone-500 mb-8">Gracias por tu preferencia, {formData.nombre.split(' ')[0]}.</p>

            <div className="bg-stone-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-stone-600 font-medium">Nos pondremos en contacto contigo en breve para coordinar tu entrega.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={onCancel} className="w-full bg-stone-900 text-white py-3 rounded-full font-bold hover:bg-stone-800 transition-all">
                Volver a la tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-900/80 z-50 overflow-y-auto flex md:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 md:max-h-[90vh]">

        {/* Left Panel: Summary & Total */}
        <div className="md:w-1/3 bg-stone-50 p-6 md:p-8 border-r border-stone-100 flex flex-col">
          <button onClick={onCancel} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors self-start">
            <ArrowLeft size={18} />
            <span className="font-medium text-sm">Volver</span>
          </button>

          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Resumen</h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-white rounded-lg border border-stone-200 flex items-center justify-center shrink-0">
                  {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover rounded-lg" /> : <span className="text-xl">💎</span>}
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm line-clamp-1">{item.name || item.sku}</p>
                  <p className="text-xs text-stone-500 mb-1">{item.cantidad} x ${item.retail_price.toLocaleString('es-MX')}</p>
                  <p className="font-bold text-amber-600 text-sm">${(item.retail_price * item.cantidad).toLocaleString('es-MX')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-stone-500">Total a pagar</span>
              <span className="text-3xl font-serif font-bold text-stone-900">${total.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 bg-white p-2 rounded-lg border border-stone-100">
              <ShieldCheck size={14} />
              Compra 100% segura y protegida
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="md:w-2/3 p-6 md:p-8 overflow-y-auto bg-white">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Información de Entrega</h2>

            <div className="space-y-8">
              {/* Section 1: Contact */}
              <section>
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-xs">
                  <User size={16} className="text-amber-500" /> Datos de contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 ml-1">Teléfono Móvil</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      placeholder="(33) 0000 0000"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Delivery Method */}
              <section>
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-xs">
                  Método de entrega
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, tipoEntrega: 'recoger' })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.tipoEntrega === 'recoger'
                      ? 'border-stone-900 bg-stone-50 text-stone-900'
                      : 'border-stone-100 hover:border-stone-200 text-stone-400'
                      }`}
                  >
                    <Store size={24} />
                    <span className="font-bold text-sm">Recoger en Tienda</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, tipoEntrega: 'envio' })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.tipoEntrega === 'envio'
                      ? 'border-stone-900 bg-stone-50 text-stone-900'
                      : 'border-stone-100 hover:border-stone-200 text-stone-400'
                      }`}
                  >
                    <Home size={24} />
                    <span className="font-bold text-sm">Envío a Domicilio</span>
                  </button>
                </div>
              </section>

              {/* Section 3: Address (Conditional) */}
              {formData.tipoEntrega === 'envio' && (
                <section className="animate-fade-in-up">
                  <h3 className="font-bold text-stone-800 mb-4 uppercase tracking-wide text-xs">Dirección de envío</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Calle y número"
                      value={formData.calle}
                      onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Colonia"
                        value={formData.colonia}
                        onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Código Postal"
                        value={formData.codigoPostal}
                        onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Estado"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none"
                      />
                    </div>
                    <textarea
                      placeholder="Referencias (Color de casa, entre calles...)"
                      value={formData.referencias}
                      onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-stone-50 border-stone-200 border rounded-lg focus:border-amber-500 focus:bg-white outline-none resize-none"
                    />
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-stone-900 text-white py-4 rounded-full font-bold text-lg hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Procesando...</>
                  ) : (
                    <>Confirmar Pedido <ArrowLeft className="rotate-180" size={20} /></>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
