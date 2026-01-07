import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useActualsHistory } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format } from 'date-fns';

export default function ActualsHistory() {
  const { scenarioId } = useScenario();
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [periodsToShow, setPeriodsToShow] = useState(12);

  const {
    data: historyData = [],
    isFetching,
    isLoading,
  } = useActualsHistory({
    scenarioId,
    periods: periodsToShow,
  });

  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-purple-400">📊 Actuals vs Budget History</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Track actual spending against your budget over time</p>
        </div>
        {isFetching && (
          <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
        )}
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Show:</span>
        <select
          value={periodsToShow}
          onChange={(e) => setPeriodsToShow(Number(e.target.value))}
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500"
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
          <option value={24}>Last 24 months</option>
        </select>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">📊</div>
          <p>Loading history...</p>
        </div>
      ) : historyData.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-semibold mb-1">No historical data available</p>
          <p className="text-xs text-gray-500">Add budget entries to see your history</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
          {historyData.map((period, idx) => {
            const isExpanded = expandedPeriod === idx;
            const summary = period.summary;
            const isOverBudget = summary.percentage > 100;
            const hasActuals = summary.entries_with_actuals > 0;

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
                      <div className="text-xs sm:text-sm font-semibold text-purple-400">
                        {format(new Date(period.period_start), 'MMM yyyy')}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        {period.period_start} → {period.period_end}
                      </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Budget */}
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Budget</div>
                        <div className="font-mono text-gray-300">{summary.total_budget.toFixed(0)}</div>
                      </div>

                      {/* Actual */}
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Actual</div>
                        <div className={`font-mono font-semibold ${hasActuals ? 'text-blue-400' : 'text-gray-500'}`}>
                          {summary.total_actual.toFixed(0)}
                        </div>
                      </div>

                      {/* Delta */}
                      <div className="hidden sm:block">
                        <div className="text-gray-500 text-[10px] uppercase">Delta</div>
                        <div className={`font-mono ${summary.total_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {summary.total_delta >= 0 ? '+' : ''}{summary.total_delta.toFixed(0)}
                        </div>
                      </div>

                      {/* Percentage */}
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Used</div>
                        <div className={`font-mono font-bold ${
                          !hasActuals ? 'text-gray-500' :
                          isOverBudget ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {summary.percentage.toFixed(1)}%
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

                  {/* Income/Expense Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    {/* Income */}
                    <div className="bg-green-600/10 rounded p-2">
                      <div className="text-gray-400 text-[10px] mb-1">💰 INCOME</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-mono text-green-400">{summary.income_budget.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Actual:</span>
                        <span className="font-mono text-green-300">{summary.income_actual.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="bg-red-600/10 rounded p-2">
                      <div className="text-gray-400 text-[10px] mb-1">💸 EXPENSES</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-mono text-red-400">{summary.expense_budget.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Actual:</span>
                        <span className="font-mono text-red-300">{summary.expense_actual.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span>{summary.entries_with_actuals} of {summary.total_entries} entries tracked</span>
                      <span>{((summary.entries_with_actuals / summary.total_entries) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(summary.entries_with_actuals / summary.total_entries) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Entries */}
                {isExpanded && period.entries.length > 0 && (
                  <div className="border-t border-gray-700 bg-gray-900/30">
                    {/* Income Section */}
                    {period.income.length > 0 && (
                      <div className="p-3 border-b border-gray-700/50">
                        <div className="text-xs font-semibold text-green-400 mb-2">💰 Income ({period.income.length})</div>
                        <div className="space-y-1">
                          {period.income.map((entry) => (
                            <EntryRow key={entry.entry_id} entry={entry} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expenses Section */}
                    {period.expenses.length > 0 && (
                      <div className="p-3">
                        <div className="text-xs font-semibold text-red-400 mb-2">💸 Expenses ({period.expenses.length})</div>
                        <div className="space-y-1">
                          {period.expenses.map((entry) => (
                            <EntryRow key={entry.entry_id} entry={entry} />
                          ))}
                        </div>
                      </div>
                    )}
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

function EntryRow({ entry }) {
  const hasActual = entry.actual > 0;
  const isOverBudget = entry.percentage > 100;
  const budgetMet = entry.percentage >= 100;

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-800 transition text-xs">
      {/* Entry Name & Category */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-200 truncate">{entry.entry_name}</div>
        <div className="text-[10px] text-gray-500 truncate">
          {entry.category_name} • {entry.entry_frequency}
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="flex items-center gap-2 text-[10px]">
        <div className="text-right">
          <div className="text-gray-500">Budget</div>
          <div className="font-mono text-gray-300">{entry.budget.toFixed(0)}</div>
        </div>
        <div className="text-gray-600">→</div>
        <div className="text-right">
          <div className="text-gray-500">Actual</div>
          <div className={`font-mono font-semibold ${
            !hasActual ? 'text-gray-500' :
            entry.entry_type === 'income' ? 'text-green-400' : 'text-blue-400'
          }`}>
            {entry.actual.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`px-2 py-1 rounded text-[10px] font-semibold min-w-[60px] text-center ${
        !hasActual ? 'bg-gray-700/50 text-gray-500' :
        entry.entry_type === 'income' ? (
          budgetMet ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
        ) : (
          isOverBudget ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
        )
      }`}>
        {!hasActual ? 'No data' :
         entry.entry_type === 'income' ? (
           budgetMet ? '✓ Met' : `${entry.percentage.toFixed(0)}%`
         ) : (
           isOverBudget ? `+${(entry.percentage - 100).toFixed(0)}%` : `${entry.percentage.toFixed(0)}%`
         )
        }
      </div>
    </div>
  );
}
