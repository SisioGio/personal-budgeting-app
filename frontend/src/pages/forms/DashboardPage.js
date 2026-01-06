import React from 'react';
import { useForecast, useActVsBud } from './../../queries/useEntries';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { useScenario } from '../../utils/ScenarioContext';
import EntriesReport from './EntriesReport';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { scenarioId } = useScenario();
  const currentPeriod = format(new Date(), 'yyyy-MM');

  const { data: forecastData = [], isLoading } = useForecast({
    scenarioId,
    timeFrame: 'monthly',
    simulateYears: 2,
  });

  const { data: actualVsBudget = [], isLoading: isLoadingActuals } = useActVsBud(scenarioId, currentPeriod);

  const formatChartData = () => {
    return forecastData.map((period) => {
      const income = period.entries
        .filter((e) => e.entry_type === 'income')
        .reduce((sum, e) => sum + e.entry_amount, 0);

      const expense = period.entries
        .filter((e) => e.entry_type === 'expense')
        .reduce((sum, e) => sum + e.entry_amount, 0);

      return {
        date: period.period_start,
        income,
        expense,
        net_balance: period.closing_balance,
        profit_loss: period.profit_loss,
      };
    });
  };

  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">📊</div>
          <p className="text-gray-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">📊 Financial Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400">Visualize your financial forecast and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">


      {/* Cash Flow / Net Balance */}

      <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-800">
        <h2 className="text-blue-400 font-bold mb-2 text-sm sm:text-base">Cash Flow / Net Balance (Monthly)</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
            <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} />
            <Line type="monotone" dataKey="net_balance" stroke="#60a5fa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profit / Loss */}
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-800">
        <h2 className="text-pink-400 font-bold mb-2 text-sm sm:text-base">Profit / Loss Over Time (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
            <Line type="monotone" dataKey="profit_loss" stroke="#facc15" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Actuals vs Budget - Current Month */}
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-purple-400 font-bold text-sm sm:text-base">
            Actuals vs Budget - {format(new Date(), 'MMMM yyyy')}
          </h2>
          {isLoadingActuals && (
            <span className="text-xs text-gray-400">Loading...</span>
          )}
        </div>

        {!isLoadingActuals && actualVsBudget.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <div className="text-3xl mb-2">📊</div>
            No actuals recorded for this month yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={actualVsBudget.length * 60 + 40}>
            <BarChart
              data={actualVsBudget}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis
                type="category"
                dataKey="entry_name"
                stroke="#aaa"
                width={120}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: 'none' }}
                formatter={(value, name) => [value, name === 'budget' ? 'Budget' : 'Actual']}
              />
              <Bar dataKey="budget" fill="#6b7280" opacity={0.4} radius={[0, 4, 4, 0]} />
              <Bar dataKey="actual" radius={[0, 4, 4, 0]}>
                {actualVsBudget.map((item, index) => {
                  const pct = item.budget ? (item.actual / item.budget) * 100 : 0;
                  const withinBudget = pct <= 100;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={withinBudget ? '#22c55e' : '#ef4444'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
<div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-800">
     <EntriesReport/>
  </div>
 
      </div>
    </div>
  );
}
