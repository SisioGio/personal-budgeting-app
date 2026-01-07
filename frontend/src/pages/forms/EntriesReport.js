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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-green-400">📈 Monthly Forecast Report</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">View projected cash flow and balances</p>
        </div>
        {isFetching && (
          <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
        )}
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">📊</div>
          <p>Loading forecast...</p>
        </div>
      ) : report.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-semibold mb-1">No forecast data available</p>
          <p className="text-xs text-gray-500">Add entries to see your financial forecast</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {report.map((p, idx) => {
            const totals = calculateTotals(p.entries);
            const isExpanded = expandedPeriod === idx;
            const isPositive = p.profit_loss >= 0;

            return (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition"
              >
                {/* Period Summary */}
                <button
                  onClick={() => setExpandedPeriod(isExpanded ? null : idx)}
                  className="w-full p-3 sm:p-4 text-left hover:bg-gray-800/70 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Period Date */}
                    <div className="flex-shrink-0">
                      <div className="text-xs sm:text-sm font-semibold text-blue-400">
                        {p.period_start}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        → {p.period_end}
                      </div>
                    </div>

                    {/* Balance Info */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Opening Balance */}
                      <div className="hidden sm:block">
                        <div className="text-gray-500 text-[10px] uppercase">Open</div>
                        <div className="font-mono text-gray-300">{p.opening_balance.toFixed(0)}</div>
                      </div>

                      {/* Profit/Loss */}
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">P/L</div>
                        <div className={`font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{p.profit_loss.toFixed(0)}
                        </div>
                      </div>

                      {/* Closing Balance */}
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Close</div>
                        <div className="font-mono font-bold text-white">{p.closing_balance.toFixed(0)}</div>
                      </div>

                      {/* Net Income/Expense */}
                      <div className="hidden sm:block">
                        <div className="text-gray-500 text-[10px] uppercase">Net</div>
                        <div className={`font-mono ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {totals.net >= 0 ? '+' : ''}{totals.net.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Income/Expense Summary Bar */}
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-gray-500">💰</span>
                      <span className="text-green-400 font-mono">{totals.totalIncome.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-gray-500">💸</span>
                      <span className="text-red-400 font-mono">{totals.totalExpenses.toFixed(0)}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Entries */}
                {isExpanded && p.entries.length > 0 && (
                  <div className="border-t border-gray-700 bg-gray-900/30">
                    <div className="p-3 space-y-1">
                      {p.entries.map((e) => (
                        <div
                          key={e.entry_id}
                          className="flex items-center justify-between gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-800 transition text-xs"
                        >
                          {/* Entry Name & Category */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-200 truncate">{e.entry_name}</div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {e.category_name} • {e.entry_frequency}
                            </div>
                          </div>

                          {/* Type Badge */}
                          <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            e.entry_type === 'income'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}>
                            {e.entry_type === 'income' ? '↑' : '↓'}
                          </div>

                          {/* Amount */}
                          <div className={`font-mono font-semibold text-right ${
                            e.entry_type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {e.entry_type === 'income' ? '+' : '-'}{e.entry_amount.toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
