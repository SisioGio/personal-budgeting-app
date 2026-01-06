import React from 'react';
import { useForecast } from './../../queries/useEntries';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useScenario } from '../../utils/ScenarioContext';
import EntriesReport from './EntriesReport';

export default function DashboardPage() {
  const { scenarioId } = useScenario();

  const { data: forecastData = [], isLoading } = useForecast({
    scenarioId,
    timeFrame: 'monthly',
    simulateYears: 2,
  });

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

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Cash Flow / Net Balance */}

      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-blue-400 font-bold mb-2">Cash Flow / Net Balance (Monthly)</h2>

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
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-pink-400 font-bold mb-2">Profit / Loss Over Time (Monthly)</h2>
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


      <EntriesReport/>
    </div>
  );
}
