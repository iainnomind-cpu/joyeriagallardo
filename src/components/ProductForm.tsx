import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { uploadProductImage } from '../lib/supabase';
import { Category, Product } from '../types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
}

export function ProductForm({ product, categories, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    codigo: product?.codigo || '',
    precio: product?.precio.toString() || '',
    categoria_id: product?.categoria_id || categories[0]?.id || '',
    imagen_url: product?.imagen_url || '',
    descripcion: product?.descripcion || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const imageUrl = await uploadProductImage(file);
      setFormData(prev => ({ ...prev, imagen_url: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setUploadError(errorMessage);
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.precio || !formData.categoria_id) {
      alert('Código, precio y categoría son obligatorios');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        codigo: formData.codigo,
        precio: parseFloat(formData.precio),
        categoria_id: formData.categoria_id,
        imagen_url: formData.imagen_url,
        descripcion: formData.descripcion,
      });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="bg-purple-600 text-white p-6 rounded-t-2xl">
            <h2 className="text-2xl font-bold">
              {product ? 'Editar' : 'Nuevo'} Producto
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Precio *</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Categoría *</label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                rows={3}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Imagen</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos: JPG, PNG, GIF, WEBP (máx. 5MB)
              </p>
              {uploading && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-purple-600 font-medium">Subiendo imagen...</p>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
              {formData.imagen_url && (
                <div className="mt-3">
                  <p className="text-xs text-green-600 mb-2">Imagen cargada correctamente</p>
                  <img
                    src={formData.imagen_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-green-200"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
            <button
              onClick={onClose}
              disabled={saving || uploading}
              className="flex-1 bg-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
