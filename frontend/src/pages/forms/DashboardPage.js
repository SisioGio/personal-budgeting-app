import React from 'react';
import { useEntries } from './../../queries/useEntries';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useScenario } from '../../utils/ScenarioContext';
export default function DashboardPage() {
  const { scenarioId } = useScenario();

  const { data: entries = [] } = useEntries({ scenarioId });

  const aggregateByDate = () => {
    let balance = 0;
    const map = {};
    entries.forEach((e) => {
      console.log(e)
      const date = e.entry_start_date;
      if (!map[date]) map[date] = { date, income: 0, expense: 0 };
      if (e.entry_type === 'income') map[date].income += e.entry_amount;
      else map[date].expense += e.entry_amount;
    });

    return Object.values(map)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((d) => {
        balance += d.income - d.expense;
        return { ...d, net_balance: balance };
      });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Cash Flow / Net Balance */}

      <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-blue-400 font-bold mb-2">Cash Flow / Net Balance</h2>

        <h1>{scenarioId}</h1>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregateByDate()}>
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
        <h2 className="text-pink-400 font-bold mb-2">Profit / Loss Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregateByDate()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
            <Line type="monotone" dataKey="net_balance" stroke="#facc15" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
