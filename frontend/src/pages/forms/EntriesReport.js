import { React, useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForecast } from '../../queries/useEntries';
import { useScenarios } from '../../queries/useScenarios';
import { useScenario } from '../../utils/ScenarioContext';


export default function EntriesReport() {
const { scenarioId } = useScenario();

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
    <div className="bg-gray-900 rounded-2xl shadow-lg p-6 col-span-1 md:col-span-2">
      <h2 className="text-green-400 font-bold mb-4">Monthly Forecast Report</h2>

      {/* Report Table */}
      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : report.length === 0 ? (
        <p className="text-gray-400">No data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="border border-gray-700 px-3 py-2 text-left">Period</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Opening</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Profit/Loss</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Closing</th>
                <th className="border border-gray-700 px-3 py-2 text-right">% Change</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Income</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Expenses</th>
                <th className="border border-gray-700 px-3 py-2 text-right">Net</th>
                <th className="border border-gray-700 px-3 py-2 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {report.map((p, idx) => {
                const totals = calculateTotals(p.entries);
                return (
                  <>
                    {/* Period summary with totals */}
                    <tr className="bg-gray-800 hover:bg-gray-750 text-gray-200">
                      <td className="border border-gray-700 px-3 py-2">
                        {p.period_start} → {p.period_end}
                      </td>
                      <td className="border border-gray-700 px-3 py-2 text-right">{p.opening_balance.toFixed(2)}</td>
                      <td className={`border border-gray-700 px-3 py-2 text-right ${p.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.profit_loss.toFixed(2)}
                      </td>
                      <td className="border border-gray-700 px-3 py-2 text-right">{p.closing_balance.toFixed(2)}</td>
                      <td className={`border border-gray-700 px-3 py-2 text-right ${p["%_change"] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p["%_change"].toFixed(2)}%
                      </td>
                      <td className="border border-gray-700 px-3 py-2 text-right text-green-400">{totals.totalIncome.toFixed(2)}</td>
                      <td className="border border-gray-700 px-3 py-2 text-right text-red-400">{totals.totalExpenses.toFixed(2)}</td>
                      <td className={`border border-gray-700 px-3 py-2 text-right ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totals.net.toFixed(2)}
                      </td>
                      <td className="border border-gray-700 px-3 py-2 text-center">
                        <button
                          className="text-blue-400 hover:text-blue-300 flex items-center justify-center mx-auto"
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
                        <tr key={e.entry_id} className="bg-gray-850 text-gray-300 text-sm">
                          <td className="border border-gray-700 px-3 py-1"></td>
                          <td className="border border-gray-700 px-3 py-1">{e.entry_name}</td>
                          <td className={`border border-gray-700 px-3 py-1 ${e.entry_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {e.entry_type}
                          </td>
                          <td className="border border-gray-700 px-3 py-1 text-right">{e.entry_amount.toFixed(2)}</td>
                          <td className="border border-gray-700 px-3 py-1">{e.category_name}</td>
                          <td className="border border-gray-700 px-3 py-1">{e.entry_frequency}</td>
                          <td className="border border-gray-700 px-3 py-1">{e.entry_date}</td>
                          <td className="border border-gray-700 px-3 py-1"></td>
                          <td className="border border-gray-700 px-3 py-1"></td>
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
