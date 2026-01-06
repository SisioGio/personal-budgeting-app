import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './../../utils/apiClient';
import { useEntries } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
export default function ActualsManager() {
    const { scenarioId } = useScenario();
  const queryClient = useQueryClient();

  /* ------------------ DATA ------------------ */
  const { data: entries = [], isLoading } = useEntries(scenarioId);

  const { data: actuals = [] } = useQuery({
    queryKey: ['actuals', scenarioId],
    queryFn: async () => {
      const res = await apiClient.get('/actuals');
      return res.data.data;
    },
    enabled: !!scenarioId,
  });

  /* ------------------ STATE ------------------ */
  const [form, setForm] = useState({
    entry_id: '',
    amount: '',
    actual_date: '',
    comment: '',
    type:''
  });

  const [editingId, setEditingId] = useState(null);

  /* ------------------ MUTATIONS ------------------ */
  const createActual = useMutation({
    mutationFn: (payload) => apiClient.post('/actuals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['actuals']);
      resetForm();
    },
  });

  const updateActual = useMutation({
    mutationFn: (payload) => apiClient.put('/actuals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['actuals']);
      resetForm();
    },
  });

  const deleteActual = useMutation({
    mutationFn: (id) => apiClient.delete('/actuals', { data: { id } }),
    onSuccess: () => queryClient.invalidateQueries(['actuals']),
  });

  /* ------------------ HELPERS ------------------ */
  const selectedEntry = entries.find(e => e.entry_id === form.entry_id);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      entry_id: '',
      amount: '',
      actual_date: '',
      comment: '',
      type: ''
    });
  };

  const handleSubmit = () => {
    if (!form.entry_id || !form.amount || !form.actual_date) return;

    editingId
      ? updateActual.mutate({ id: editingId, ...form })
      : createActual.mutate(form);
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({
      entry_id: a.entry_id,
      amount: a.amount,
      actual_date: a.actual_date,
      comment: a.comment || '',
      type: a.type
 

    });
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-xl border border-gray-700">
        <h3 className="font-mono text-blue-400 text-lg mb-4">
          Record Actual
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

          <select
            name="entry_id"
            value={form.entry_id}
            onChange={handleChange}
             className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
  
          >
            <option value="">Select Entry</option>
            {entries.map((e) => (
              <option key={e.entry_id} value={e.entry_id}>
                {e.entry_name} · {e.category_name}
              </option>
            ))}
          </select>

   
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
  
          />

   
          <input
            type="date"
            name="actual_date"
            value={form.actual_date}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
  
          />

        
          <input
            name="comment"
            placeholder="Comment (optional)"
            value={form.comment}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
  
          />



          <div className="grid grid-cols-2 gap-2">
        {['income', 'expense'].map((type) => (
          <label
            key={type}
            className={`cursor-pointer px-4 py-2 rounded-lg border text-center font-semibold transition
              ${
                form.type === type
                  ? type === 'income'
                    ? 'bg-green-600/20 border-green-500 text-green-400'
                    : 'bg-red-600/20 border-red-500 text-red-400'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
          >
            <input
              type="checkbox"
              checked={form.type === type}
              onChange={() =>
                handleChange({ target: { name: 'type', value: type } })
              }
              className="hidden"
            />
            {type === 'income' ? '💰 Income' : '💸 Expense'}
          </label>
        ))}
      </div>

 <div className="flex gap-2 ">
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl font-semibold transition
              ${
                editingId
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
          >
            {editingId ? 'Update Actual' : 'Add Actual'}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
          )}
        </div>

        </div>

  
     

       
      </div>


      <div className="max-h-[500px] overflow-y-auto space-y-3">
        {actuals.length === 0 && (
          <p className="text-center text-gray-400">No actuals recorded</p>
        )}

        {actuals.map((a) => {
          const entry = entries.find(e => e.entry_id === a.entry_id);

          return (
            <div
              key={a.id}
              className="relative p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500 transition shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-blue-400 text-sm">
                    {a.actual_date}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {entry?.entry_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry?.category_name}
                  </p>
                </div>

                <p
                  className={`font-mono text-lg ${
                    entry?.entry_type === 'income'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {entry?.entry_type === 'income' ? '+' : '-'}
                  {a.amount}
                </p>
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => startEdit(a)}
                  className="px-2 py-1 text-xs rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteActual.mutate(a.id)}
                  className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
