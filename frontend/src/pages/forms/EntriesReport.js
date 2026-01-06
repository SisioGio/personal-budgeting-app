import { React, useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForecast } from '../../queries/useEntries';
import { useScenarios } from '../../queries/useScenarios';



export default function EntriesReport({scenarioId}) {


    const queryClient = useQueryClient();
    


  const [timeFrame, setTimeFrame] = useState("monthly");
  const [periods, setPeriods] = useState(12);
  const [simulateYears, setSimulateYears] = useState(1);


 

  const [expandedPeriod, setExpandedPeriod] = useState(null);


  const {
    data: report = [],
    isFetching,
  } = useForecast({
    scenarioId,
    timeFrame,
    periods,
    simulateYears,
  });


  const { data: scenarios = [], isLoading } = useScenarios();



//   const fetchReport = async () => {
//     if (!scenarioId) return;
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         scenario_id: scenarioId,
//         time_frame: timeFrame,
//         periods,
//         simulate_years: simulateYears,
//       });
//       const { data } = await apiClient.get(`/private/entries?${params}`);
//       setReport(data.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchScenarios();
//   }, []);

//   useEffect(() => {
//     fetchReport();
//   }, [scenarioId, timeFrame, periods, simulateYears]);

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



      {/* Report Table */}
      {isLoading ? (
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
