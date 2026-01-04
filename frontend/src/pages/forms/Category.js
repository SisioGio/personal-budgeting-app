import { useEffect, useState } from 'react';

import apiClient from '../../utils/apiClient';

export default function CategoryCRUD() {

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await apiClient.get('/category');
    setCategories(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await apiClient.post('/category', { name });
    setName('');
    fetchCategories();
  };

  const handleUpdate = async () => {
    if (!name.trim() || !editingId) return;
    await apiClient.put('/category', { id: editingId, name });
    setName('');
    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await apiClient.delete('/category', { data: { id } });
    fetchCategories();
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {editingId ? (
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <ul className="divide-y">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between p-4">
                <span className="font-medium">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-sm px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
