import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './../../utils/apiClient';
import { useEntries } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
import ActualsVsBudget from './ActualsVsBudget';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format, subMonths } from "date-fns";


export default function ActualsManager() {
    const { scenarioId } = useScenario();
  const queryClient = useQueryClient();
    const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  
   const lastNextMonths = Array.from({ length: 13 }, (_, i) => {
    return format(subMonths(new Date(), 6 - i), "yyyy-MM");
  });



  /* ------------------ DATA ------------------ */
  const { data: entries = [] } = useEntries(scenarioId);

  const { data: actuals = [] } = useQuery({
    queryKey: ['actuals',period],
    queryFn: async () => {
      const res = await apiClient.get(`/actuals?period=${period}`,);
      return res.data.data;
    },
    enabled: !!period,
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
  // const selectedEntry = entries.find(e => e.entry_id === form.entry_id);

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
  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">💰 Actuals Manager</h1>
          <p className="text-sm sm:text-base text-gray-400">Record and track your actual income and expenses</p>
        </div>
      </div>





      <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 shadow-xl border border-gray-700">
        <h3 className="font-mono text-blue-400 text-base sm:text-lg mb-3 sm:mb-4">
          Record Actual
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">

          <select
            name="entry_id"
            value={form.entry_id}
            onChange={handleChange}
            required
             className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"

          >
            <option value="">Select Entry *</option>
            {entries.map((e) => (
              <option key={e.entry_id} value={e.entry_id}>
                {e.entry_name} · {e.category_name}
              </option>
            ))}
          </select>


          <input
            type="number"
            name="amount"
            placeholder="Amount *"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"

          />


          <input
            type="date"
            name="actual_date"
            value={form.actual_date}
            onChange={handleChange}
            required
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
            disabled={!form.entry_id || !form.amount || !form.actual_date || !form.type}
            className={`px-5 py-2 rounded-xl font-semibold transition
              ${
                !form.entry_id || !form.amount || !form.actual_date || !form.type
                  ? 'bg-gray-600 cursor-not-allowed'
                  : editingId
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


      <div className="mb-3 sm:mb-4 flex space-x-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {lastNextMonths.map((m) => {
                const isActive = period === m;
                return (
                  <button
                    key={m}
                    onClick={() => setPeriod(m)}
                    className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {format(new Date(m + "-01"), "MMM yyyy")}
                  </button>
                );
              })}
            </div>



      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4'>
            <div className="max-h-[500px] overflow-y-auto space-y-1.5 col-span-1">
                    {actuals.length === 0 && (
                      <div className="p-8 text-center space-y-3">
                        <div className="text-4xl">💸</div>
                        <div className="text-gray-400 font-semibold text-sm">
                          No actuals for {format(new Date(period + "-01"), "MMMM yyyy")}
                        </div>
                        <p className="text-xs text-gray-500">
                          Record your first actual transaction above
                        </p>
                      </div>
                    )}

                    {actuals.map((a) => {
                      const entry = entries.find(e => e.entry_id === a.entry_id);

                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-2 p-1.5 rounded bg-gray-900 border border-gray-800 hover:border-blue-500 transition text-xs"
                        >
                          <span className="font-mono text-blue-400 flex-shrink-0">
                            {a.actual_date}
                          </span>
                          <span className="text-gray-300 truncate flex-1 min-w-0">
                            {entry?.entry_name}
                          </span>
                          <span className="text-gray-500 text-[10px] flex-shrink-0">
                            {entry?.category_name}
                          </span>
                          <span
                            className={`font-mono font-semibold flex-shrink-0 ${
                              entry?.entry_type === 'income'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {entry?.entry_type === 'income' ? '+' : '-'}
                            {a.amount}
                          </span>
                          <button
                            onClick={() => startEdit(a)}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteActual.mutate(a.id)}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                          >
                            Del
                          </button>
                        </div>
                      );
                    })}
              </div>
      <div className='col-span-1 md:col-span-2'>
      <ActualsVsBudget period={period}/>
      </div>
            
      </div>
      
    </div>
  );
}
