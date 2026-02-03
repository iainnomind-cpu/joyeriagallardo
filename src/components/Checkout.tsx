import { useState } from 'react';
import { User, Home, Store, CheckCircle } from 'lucide-react';
import { OrderFormData, CartItem } from '../types';

interface CheckoutProps {
  total: number;
  items: CartItem[];
  onSubmit: (formData: OrderFormData) => Promise<void>;
  onCancel: () => void;
}

export function Checkout({ total, items, onSubmit, onCancel }: CheckoutProps) {
  const [orderComplete, setOrderComplete] = useState(false);
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

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      alert('Por favor completa nombre y teléfono');
      return;
    }

    if (formData.tipoEntrega === 'envio') {
      if (!formData.calle || !formData.numeroExterior || !formData.colonia || !formData.ciudad || !formData.estado) {
        alert('Por favor completa todos los campos de dirección');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setOrderComplete(true);
      setTimeout(() => {
        onCancel();
      }, 4000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-12 text-center">
              <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Pedido Confirmado</h2>
              <p className="text-gray-600">Gracias {formData.nombre}</p>
              <p className="text-sm text-gray-500 mt-2">Te contactaremos pronto</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="bg-purple-600 text-white p-6 rounded-t-2xl">
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
            <p>Total: ${total}</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <User size={20} /> Datos Personales
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Tipo de Entrega</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, tipoEntrega: 'recoger' })}
                  className={`p-4 rounded-lg border-2 ${
                    formData.tipoEntrega === 'recoger'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store size={32} className="mx-auto mb-2" />
                  <p className="font-bold">Recoger</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, tipoEntrega: 'envio' })}
                  className={`p-4 rounded-lg border-2 ${
                    formData.tipoEntrega === 'envio'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home size={32} className="mx-auto mb-2" />
                  <p className="font-bold">Envío</p>
                </button>
              </div>
            </div>
            {formData.tipoEntrega === 'envio' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-bold">Dirección</h4>
                <input
                  type="text"
                  placeholder="Calle *"
                  value={formData.calle}
                  onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Número Ext *"
                    value={formData.numeroExterior}
                    onChange={(e) => setFormData({ ...formData, numeroExterior: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Número Int"
                    value={formData.numeroInterior}
                    onChange={(e) => setFormData({ ...formData, numeroInterior: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Colonia *"
                  value={formData.colonia}
                  onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ciudad *"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Estado *"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Código Postal"
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
                <textarea
                  placeholder="Referencias adicionales"
                  value={formData.referencias}
                  onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none"
                />
              </div>
            )}
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
