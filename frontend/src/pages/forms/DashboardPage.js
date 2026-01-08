import React, { useState, useEffect } from 'react';
import { useForecast, useActVsBud } from './../../queries/useEntries';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { useScenario } from '../../utils/ScenarioContext';
import EntriesReport from './EntriesReport';
import ActualsHistory from './ActualsHistory';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeSlashIcon, Bars3Icon } from '@heroicons/react/24/outline';

const DASHBOARD_WIDGETS_KEY = 'finance-dashboard-widgets';

const DEFAULT_WIDGETS = {
  cashFlow: { visible: true, expanded: true, order: 0 },
  profitLoss: { visible: true, expanded: true, order: 1 },
  entriesReport: { visible: true, expanded: false, order: 2 },
  actualsHistory: { visible: true, expanded: false, order: 3 },
};

export default function DashboardPage() {
  const { scenarioId } = useScenario();
  const currentPeriod = format(new Date(), 'yyyy-MM');

  // Load widget preferences from localStorage
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem(DASHBOARD_WIDGETS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  const { data: forecastData = [], isLoading } = useForecast({
    scenarioId,
    timeFrame: 'monthly',
    simulateYears: 2,
  });

  const { data: actualVsBudget = [], isLoading: isLoadingActuals } = useActVsBud(scenarioId, currentPeriod);

  // Save widget preferences to localStorage
  useEffect(() => {
    localStorage.setItem(DASHBOARD_WIDGETS_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = (widgetKey) => {
    setWidgets((prev) => ({
      ...prev,
      [widgetKey]: {
        ...prev[widgetKey],
        expanded: !prev[widgetKey].expanded,
      },
    }));
  };

  const toggleWidgetVisibility = (widgetKey) => {
    setWidgets((prev) => ({
      ...prev,
      [widgetKey]: {
        ...prev[widgetKey],
        visible: !prev[widgetKey].visible,
      },
    }));
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const moveWidget = (fromKey, toKey) => {
    setWidgets((prev) => {
      const entries = Object.entries(prev);
      const fromIndex = entries.findIndex(([key]) => key === fromKey);
      const toIndex = entries.findIndex(([key]) => key === toKey);

      if (fromIndex === -1 || toIndex === -1) return prev;

      // Reorder the entries
      const newEntries = [...entries];
      const [movedItem] = newEntries.splice(fromIndex, 1);
      newEntries.splice(toIndex, 0, movedItem);

      // Update order values
      const updated = {};
      newEntries.forEach(([key, config], index) => {
        updated[key] = { ...config, order: index };
      });

      return updated;
    });
  };

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

  const widgetComponents = {
    cashFlow: {
      title: 'Cash Flow / Net Balance (Monthly)',
      icon: '💰',
      color: 'blue',
      component: (
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
      ),
    },
    profitLoss: {
      title: 'Profit / Loss Over Time (Monthly)',
      icon: '📈',
      color: 'pink',
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
            <Line type="monotone" dataKey="profit_loss" stroke="#facc15" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    // actualsVsBudget: {
    //   title: `Actuals vs Budget - ${format(new Date(), 'MMMM yyyy')}`,
    //   icon: '📊',
    //   color: 'purple',
    //   component: (
    //     <>
    //       {isLoadingActuals && (
    //         <div className="text-center py-6">
    //           <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
    //         </div>
    //       )}
    //       {!isLoadingActuals && actualVsBudget.length === 0 ? (
    //         <div className="text-center py-6 text-gray-400 text-sm">
    //           <div className="text-3xl mb-2">📊</div>
    //           No actuals recorded for this month yet
    //         </div>
    //       ) : (
    //         <ResponsiveContainer width="100%" height={actualVsBudget.length * 60 + 40}>
    //           <BarChart
    //             data={actualVsBudget}
    //             layout="vertical"
    //             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    //           >
    //             <CartesianGrid strokeDasharray="3 3" stroke="#444" />
    //             <XAxis type="number" stroke="#aaa" />
    //             <YAxis
    //               type="category"
    //               dataKey="entry_name"
    //               stroke="#aaa"
    //               width={120}
    //               style={{ fontSize: '12px' }}
    //             />
    //             <Tooltip
    //               contentStyle={{ backgroundColor: '#111', border: 'none' }}
    //               formatter={(value, name) => [value, name === 'budget' ? 'Budget' : 'Actual']}
    //             />
    //             <Bar dataKey="budget" fill="#6b7280" opacity={0.4} radius={[0, 4, 4, 0]} />
    //             <Bar dataKey="actual" radius={[0, 4, 4, 0]}>
    //               {actualVsBudget.map((item, index) => {
    //                 const pct = item.budget ? (item.actual / item.budget) * 100 : 0;
    //                 const withinBudget = pct <= 100;
    //                 return (
    //                   <Cell
    //                     key={`cell-${index}`}
    //                     fill={withinBudget ? '#22c55e' : '#ef4444'}
    //                   />
    //                 );
    //               })}
    //             </Bar>
    //           </BarChart>
    //         </ResponsiveContainer>
    //       )}
    //     </>
    //   ),
    // },
    entriesReport: {
      title: 'Monthly Forecast Report',
      icon: '📈 ',
      color: 'green',
      component: <EntriesReport />,
    },
    actualsHistory: {
      title: 'Actuals vs Budget History',
      icon: '📊',
      color: 'purple',
      component: <ActualsHistory />,
    },
  };

  // Get visible widgets sorted by order
  const visibleWidgets = Object.entries(widgets)
    .filter(([, config]) => config.visible)
    .sort((a, b) => a[1].order - b[1].order);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">📊 Financial Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400">Visualize your financial forecast and performance</p>
        </div>

        {/* Widget Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetWidgets}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition"
          >
            Reset Layout
          </button>
        </div>
      </div>

      {/* Widget Visibility Toggles */}
      <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">Widget Visibility</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(widgetComponents).map(([key, widget]) => (
            <button
              key={key}
              onClick={() => toggleWidgetVisibility(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                widgets[key].visible
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}
            >
              {widgets[key].visible ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeSlashIcon className="w-4 h-4" />
              )}
              <span>{widget.icon} {widget.title.split(' - ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {visibleWidgets.map(([key, config]) => {
          const widget = widgetComponents[key];
          if (!widget) return null;

          return (
            <DashboardWidget
              key={key}
              widgetKey={key}
              title={widget.title}
              icon={widget.icon}
              color={widget.color}
              expanded={config.expanded}
              onToggle={() => toggleWidget(key)}
              onMove={moveWidget}
            >
              {widget.component}
            </DashboardWidget>
          );
        })}
      </div>
    </div>
  );
}

function DashboardWidget({ widgetKey, title, icon, color, expanded, onToggle, onMove, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const colorClasses = {
    blue: 'text-blue-400 border-blue-600/30 bg-blue-600/5',
    pink: 'text-pink-400 border-pink-600/30 bg-pink-600/5',
    purple: 'text-purple-400 border-purple-600/30 bg-purple-600/5',
    green: 'text-green-400 border-green-600/30 bg-green-600/5',
  };

  const glowClasses = {
    blue: 'shadow-blue-500/20',
    pink: 'shadow-pink-500/20',
    purple: 'shadow-purple-500/20',
    green: 'shadow-green-500/20',
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetKey);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fromKey = e.dataTransfer.getData('text/plain');
    if (fromKey && fromKey !== widgetKey) {
      onMove(fromKey, widgetKey);
    }
    setIsDragOver(false);
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden
        transition-all duration-500 ease-in-out
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'ring-4 ring-purple-500/50 scale-105' : ''}
        ${expanded
          ? `lg:col-span-2 ${glowClasses[color]} shadow-2xl scale-[1.01] border-${color.split('-')[0]}-600/50`
          : 'hover:shadow-xl hover:scale-[1.02] border-gray-800 hover:border-gray-700'
        }
        cursor-move
      `}
    >
      {/* Widget Header */}
      <div
        className={`
          w-full p-4 sm:p-6 flex items-center justify-between
          transition-all duration-300
          ${expanded
            ? `${colorClasses[color]} border-b border-${color.split('-')[0]}-600/20`
            : 'hover:bg-gray-800/50'
          }
        `}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Drag Handle */}
          <Bars3Icon className="w-5 h-5 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing transition" />

          <span
            className={`
              text-xl sm:text-2xl transition-transform duration-300
              ${expanded ? 'scale-110 animate-pulse' : ''}
            `}
          >
            {icon}
          </span>
          <h2 className={`font-bold text-sm sm:text-base transition-all duration-300 ${colorClasses[color].split(' ')[0]}`}>
            {title}
          </h2>
          {expanded && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-400 animate-fade-in">
              Expanded
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 hover:bg-gray-700/50 rounded-lg p-1 transition"
        >
          {expanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400 transition-transform duration-300 rotate-180" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Widget Content */}
      <div
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
