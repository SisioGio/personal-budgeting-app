import { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';

export default function EntriesCRUD() {
  const [entries, setEntries] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scenarioId, setScenarioId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'income',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    amount: '',
    category_id: '',
  });

  const fetchScenarios = async () => {
    const res = await apiClient.get('/scenario');
    setScenarios(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await apiClient.get('/category');
    setCategories(res.data.data);
  };

  const fetchEntries = async (sid) => {
    if (!sid) return;
    setLoading(true);
    const res = await apiClient.get('/entries', {
      params: { scenario_id: sid },
    });
    setEntries(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScenarios();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEntries(scenarioId);
  }, [scenarioId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      name: '',
      type: 'income',
      frequency: 'monthly',
      start_date: '',
      end_date: '',
      amount: '',
      category_id: '',
    });
    setEditingId(null);
  };

  const handleCreate = async () => {
    await apiClient.post('/entries', {
      ...form,
      amount: Number(form.amount),
      scenario_id: scenarioId,
    });
    resetForm();
    fetchEntries(scenarioId);
  };

  const handleUpdate = async () => {
    await apiClient.put('/entries', {
      id: editingId,
      amount: Number(form.amount),
    });
    resetForm();
    fetchEntries(scenarioId);
  };

  const handleDelete = async (id) => {
    await apiClient.delete('/entries', { data: { id } });
    fetchEntries(scenarioId);
  };

  const startEdit = (e) => {
    setEditingId(e.entry_id);
    setForm({
      name: e.entry_name,
      type: e.entry_type,
      frequency: e.entry_frequency,
      start_date: e.entry_start_date,
      end_date: e.entry_end_date,
      amount: e.entry_amount,
      category_id: e.entry_category_id,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      <select
        value={scenarioId}
        onChange={(e) => setScenarioId(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full md:w-1/2"
      >
        <option value="">Select scenario</option>
        {scenarios.map((s) => (
          <option key={s.id ?? s.code} value={s.id}>
            {s.code}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border rounded px-2 py-1 md:col-span-2"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          name="frequency"
          value={form.frequency}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />

        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="border rounded px-2 py-1 md:col-span-2"
        >
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-6">
        {editingId ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={!scenarioId}
          >
            Add Entry
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>

              <th className="p-2 text-left">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Frequency</th>
              <th className="p-2">Category</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.entry_name}</td>
                <td className="p-2 text-center">{e.entry_type}</td>
                <td className="p-2 text-center">{e.entry_frequency}</td>
                <td className="p-2 text-center">{e.category_name}</td>
                <td className="p-2 text-right font-mono">{e.entry_amount}</td>
                <td className="p-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => startEdit(e)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
