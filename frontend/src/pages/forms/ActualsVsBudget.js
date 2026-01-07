import  { useEffect } from "react";
import { useActVsBud } from "../../queries/useEntries";
import { useScenario } from "../../utils/ScenarioContext";


export default function ActVsBudReport({period}) {
  const { scenarioId } = useScenario();


  const { data, isLoading, refetch } = useActVsBud(scenarioId, period);

  useEffect(() => {
    if (scenarioId) refetch();
  }, [period, scenarioId, refetch]);

  if (!scenarioId) return <p className="text-gray-400 p-4">Select a scenario</p>;
  if (isLoading) return <p className="text-gray-400 p-4">Loading...</p>;

  return (
    <div className="">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {data?.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm">
            No entries
          </p>
        )}

        {data?.map((row) => {
          const pct = row.budget ? (row.actual / row.budget) * 100 : 0;
          const withinBudget = pct <= 100;

          return (
            <div
              key={row.entry_id}
              className="relative p-1.5 rounded bg-gray-900 border border-gray-800 hover:border-blue-500 transition"
            >
              <p className="font-semibold text-gray-300 text-xs truncate">{row.entry_name}</p>

              {/* Progress Bar */}
              <div className="w-full h-1.5 mt-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${withinBudget ? "bg-green-400" : "bg-red-500"} transition-all`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Budget / Actual */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Budget: <span className="text-gray-300 font-mono">{row.budget}</span></span>
                <span>Actual: <span className="text-gray-300 font-mono">{row.actual}</span></span>
              </div>

              {/* Delta */}
              <div
                className={`text-[10px] font-semibold mt-0.5 text-right ${
                  withinBudget ? "text-green-400" : "text-red-400"
                }`}
              >
                Δ <span className="font-mono">{row.delta.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
