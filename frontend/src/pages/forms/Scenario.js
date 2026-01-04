import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../utils/apiClient';

export default function ScenarioCRUD() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [editingCode, setEditingCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchScenarios = async () => {
    setLoading(true);
    const res = await apiClient.get('/scenario');
    setScenarios(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const resetForm = () => {
    setCode('');
    setDescription('');
    setEditingCode(null);
  };

  const handleCreate = async () => {
    if (!code.trim()) return;
    await apiClient.post('/scenario', { code, description });
    resetForm();
    fetchScenarios();
  };

  const handleUpdate = async () => {
    if (!editingCode) return;
    await apiClient.put('/scenario', {
      code: editingCode,
      description,
    });
    resetForm();
    fetchScenarios();
  };

  const handleDelete = async (scenarioCode) => {
    await apiClient.delete('/scenario', {
      data: { code: scenarioCode },
    });
    fetchScenarios();
  };

  const startEdit = (scenario) => {
    setEditingCode(scenario.code);
    setCode(scenario.code);
    setDescription(scenario.description || '');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Scenarios</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Scenario code"
          value={code}
          disabled={!!editingCode}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 focus:outline-none focus:ring md:col-span-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-8">
        {editingCode ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium w-40"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.code} className="border-t">
                  <td className="p-3 font-mono">{s.code}</td>
                  <td className="p-3">{s.description}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-sm px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.code)}
                        className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {scenarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No scenarios found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
