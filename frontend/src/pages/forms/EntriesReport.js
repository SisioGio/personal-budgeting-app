import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";

export default function EntriesReport() {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [periods, setPeriods] = useState(12);
  const [simulateYears, setSimulateYears] = useState(2);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
const [scenarios, setScenarios] = useState([]);
const [scenarioId, setScenarioId] = useState('');

    const fetchScenarios = async () => {
    const res = await apiClient.get('/scenario');
    setScenarios(res.data.data);
  };


  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        time_frame: timeFrame,
        periods,
        simulate_years: simulateYears,
        scenario_id: scenarioId
      });
      const { data } = await apiClient.get(`/private/entries?${params}`);
      setReport(data.data);
    } catch (err) {
      console.error("Failed to fetch entries report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchScenarios();
  },[])
  useEffect(() => {
    fetchReport();
  }, [timeFrame, periods, simulateYears]);

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Entries Report</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
<div>
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

</div>

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

      {/* Report */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        report.map((period) => (
          <div key={period.period_start} className="border rounded p-4">
            <h3 className="font-semibold mb-2">
              {period.period_start} → {period.period_end}
            </h3>
            <div className="flex justify-between mb-2">
              <span>Opening: {period.opening_balance}</span>
              <span>Profit/Loss: {period.profit_loss}</span>
              <span>Closing: {period.closing_balance}</span>
              <span>% Change: {period["%_change"].toFixed(2)}%</span>
            </div>
            <table className="w-full border-t border-b">
              <thead>
                <tr className="text-left">
                  <th className="py-1">Entry</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {period.entries.map((e) => (
                  <tr key={e.entry_id} className="border-b">
                    <td className="py-1">{e.entry_name}</td>
                    <td>{e.entry_type}</td>
                    <td>{e.entry_amount}</td>
                    <td>{e.category_name}</td>
                    <td>{e.entry_frequency}</td>
                    <td>{e.entry_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
