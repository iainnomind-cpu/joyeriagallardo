import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    setLoading(true);
    try {
      await addCategory(newCategoryName);
      setNewCategoryName('');

      const channel = new BroadcastChannel('perlas-ac-updates');
      channel.postMessage({ type: 'category-updated' });
      channel.close();

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar categoría');
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      await updateCategory(id, editingName);
      setEditingId(null);
      setEditingName('');

      const channel = new BroadcastChannel('perlas-ac-updates');
      channel.postMessage({ type: 'category-updated' });
      channel.close();

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar categoría');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?\n\nEsto solo es posible si no hay productos usando esta categoría.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteCategory(id);

      const channel = new BroadcastChannel('perlas-ac-updates');
      channel.postMessage({ type: 'category-updated' });
      channel.close();

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar categoría';
      alert(`${message}`);
      setLoading(false);
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Categorías</h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Nueva Categoría</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nombre de la categoría"
            disabled={loading}
            className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !newCategoryName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Agregar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 mb-3">
          Categorías Existentes ({categories.length})
        </h3>

        {categories.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay categorías creadas</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                      className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(category.id)}
                      disabled={loading}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      title="Guardar"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50"
                      title="Cancelar"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">
                      {category.name}
                    </span>
                    <button
                      onClick={() => startEdit(category.id, category.name)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
