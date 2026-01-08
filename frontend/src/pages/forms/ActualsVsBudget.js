import { useEffect, useMemo } from "react";
import { useActVsBud } from "../../queries/useEntries";
import { useScenario } from "../../utils/ScenarioContext";


export default function ActVsBudReport({period}) {
  const { scenarioId } = useScenario();


  const { data, isLoading, refetch } = useActVsBud(scenarioId, period);

  useEffect(() => {
    if (scenarioId) refetch();
  }, [period, scenarioId, refetch]);

  // Calculate summary totals
  const summary = useMemo(() => {
    if (!data || data.length === 0) return { totalBudget: 0, totalActual: 0, totalDelta: 0, overBudgetCount: 0 };

    return data.reduce((acc, row) => {
      const pct = row.budget ? (row.actual / row.budget) * 100 : 0;
      return {
        totalBudget: acc.totalBudget + parseFloat(row.budget),
        totalActual: acc.totalActual + parseFloat(row.actual),
        totalDelta: acc.totalDelta + parseFloat(row.delta),
        overBudgetCount: acc.overBudgetCount + (pct > 100 ? 1 : 0)
      };
    }, { totalBudget: 0, totalActual: 0, totalDelta: 0, overBudgetCount: 0 });
  }, [data]);

  const overallPct = summary.totalBudget ? (summary.totalActual / summary.totalBudget) * 100 : 0;

  if (!scenarioId) return <p className="text-gray-400 p-4">Select a scenario</p>;
  if (isLoading) return <p className="text-gray-400 p-4">Loading...</p>;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {data && data.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Period Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] text-gray-400">Total Budget</div>
              <div className="text-lg font-bold text-white">${summary.totalBudget.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Total Actual</div>
              <div className="text-lg font-bold text-white">${summary.totalActual.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Remaining</div>
              <div className={`text-lg font-bold ${summary.totalDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${summary.totalDelta.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Usage</div>
              <div className={`text-lg font-bold ${overallPct <= 100 ? 'text-green-400' : 'text-red-400'}`}>
                {overallPct.toFixed(0)}%
              </div>
            </div>
          </div>
          {/* Overall Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${overallPct <= 100 ? "bg-green-400" : "bg-red-500"} transition-all`}
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {data?.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm p-8">
            No budget entries for this period
          </p>
        )}

        {data?.map((row) => {
          const pct = row.budget ? (row.actual / row.budget) * 100 : 0;
          const withinBudget = pct <= 100;
          const remaining = parseFloat(row.delta);

          return (
            <div
              key={row.entry_id}
              className={`relative p-2 rounded-lg border transition ${
                withinBudget
                  ? 'bg-gray-900 border-gray-800 hover:border-green-500'
                  : 'bg-red-900/20 border-red-800 hover:border-red-600'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-gray-300 text-xs truncate flex-1">{row.entry_name}</p>
                <span className={`text-[10px] font-bold ml-2 ${withinBudget ? 'text-green-400' : 'text-red-400'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 mt-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${withinBudget ? "bg-green-400" : "bg-red-500"} transition-all`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Budget / Actual */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                <span>Budget: <span className="text-gray-300 font-mono font-semibold">${row.budget}</span></span>
                <span>Actual: <span className="text-gray-300 font-mono font-semibold">${row.actual}</span></span>
              </div>

              {/* Remaining Amount */}
              <div className="mt-1 text-[10px] text-center">
                <span className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {remaining >= 0 ? '✓' : '⚠️'} {remaining >= 0 ? 'Under' : 'Over'} by ${Math.abs(remaining).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
