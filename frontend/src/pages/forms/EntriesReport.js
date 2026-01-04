import { React, useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function EntriesReport() {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [periods, setPeriods] = useState(12);
  const [simulateYears, setSimulateYears] = useState(1);
  const [scenarioId, setScenarioId] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState(null);

  const fetchScenarios = async () => {
    const res = await apiClient.get("/scenario");
    setScenarios(res.data.data);
    if (res.data.data?.length > 0) {
      setScenarioId(res.data.data[0].id);
    }
  };

  const fetchReport = async () => {
    if (!scenarioId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        scenario_id: scenarioId,
        time_frame: timeFrame,
        periods,
        simulate_years: simulateYears,
      });
      const { data } = await apiClient.get(`/private/entries?${params}`);
      setReport(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [scenarioId, timeFrame, periods, simulateYears]);

  const calculateTotals = (entries) => {
    const totalIncome = entries
      .filter((e) => e.entry_type === "income")
      .reduce((sum, e) => sum + e.entry_amount, 0);
    const totalExpenses = entries
      .filter((e) => e.entry_type === "expense")
      .reduce((sum, e) => sum + e.entry_amount, 0);
    const net = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, net };
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Entries Report</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          className="border rounded px-3 py-2 mb-4 w-full md:w-1/2"
        >
          <option value="">Select scenario</option>
          {scenarios.map((s) => (
            <option key={s.id ?? s.code} value={s.id ?? s.code}>
              {s.code}
            </option>
          ))}
        </select>

        <div>
          <label className="mr-2 font-medium">Time Frame:</label>
          <select
            className="border rounded px-2 py-1"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Periods:</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={periods}
            min={1}
            onChange={(e) => setPeriods(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="mr-2 font-medium">Simulate Years:</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={simulateYears}
            min={0}
            onChange={(e) => setSimulateYears(Number(e.target.value))}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          onClick={fetchReport}
        >
          Refresh
        </button>
      </div>

      {/* Report Table */}
      {loading ? (
        <p>Loading...</p>
      ) : report.length === 0 ? (
        <p>No data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">Period</th>
                <th className="border px-3 py-2">Opening</th>
                <th className="border px-3 py-2">Profit/Loss</th>
                <th className="border px-3 py-2">Closing</th>
                <th className="border px-3 py-2">% Change</th>
                <th className="border px-3 py-2">Total Income</th>
                <th className="border px-3 py-2">Total Expenses</th>
                <th className="border px-3 py-2">Net</th>
                <th className="border px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {report.map((p, idx) => {
                const totals = calculateTotals(p.entries);
                return (
                  <>
                    {/* Period summary with totals */}
                    <tr className="border-t">
                      <td className="border px-3 py-2">
                        {p.period_start} → {p.period_end}
                      </td>
                      <td className="border px-3 py-2">{p.opening_balance}</td>
                      <td className="border px-3 py-2">{p.profit_loss}</td>
                      <td className="border px-3 py-2">{p.closing_balance}</td>
                      <td className="border px-3 py-2">{p["%_change"].toFixed(2)}%</td>
                      <td className="border px-3 py-2">{totals.totalIncome}</td>
                      <td className="border px-3 py-2">{totals.totalExpenses}</td>
                      <td className="border px-3 py-2">{totals.net}</td>
                      <td className="border px-3 py-2 text-center">
                        <button
                          className="text-blue-600 hover:underline flex items-center justify-center"
                          onClick={() =>
                            setExpandedPeriod(expandedPeriod === idx ? null : idx)
                          }
                        >
                          {expandedPeriod === idx ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded entries */}
                    {expandedPeriod === idx &&
                      p.entries.map((e) => (
                        <tr key={e.entry_id} className="bg-gray-50">
                          <td className="border px-3 py-1"></td>
                          <td className="border px-3 py-1">{e.entry_name}</td>
                          <td className="border px-3 py-1">{e.entry_type}</td>
                          <td className="border px-3 py-1">{e.entry_amount}</td>
                          <td className="border px-3 py-1">{e.category_name}</td>
                          <td className="border px-3 py-1">{e.entry_frequency}</td>
                          <td className="border px-3 py-1">{e.entry_date}</td>
                          <td className="border px-3 py-1"></td>
                          <td className="border px-3 py-1"></td>
                        </tr>
                      ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
