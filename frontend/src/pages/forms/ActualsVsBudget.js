import { useScenario } from '../../utils/ScenarioContext';
import { useActVsBud } from '../../queries/useEntries';

export default function ActualsVsBudget() {
  const { scenarioId } = useScenario();
  const { data, isLoading, error } = useActVsBud(scenarioId);

  if (!scenarioId) {
    return (
      <div className="text-gray-400 text-center py-12">
        Select a scenario to view reports
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-blue-400 text-center py-12 animate-pulse">
        Loading actuals vs budget…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-12">
        Failed to load report
      </div>
    );
  }

  const grouped = groupByPeriod(data);

  return (
    <div className="space-y-8">

      {grouped.map((periodBlock) => (
        <div
          key={periodBlock.period}
          className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                     shadow-xl border border-gray-800 p-6"
        >
          {/* Period Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-blue-400 tracking-wide">
              {periodBlock.period}
            </h3>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Actuals vs Budget
            </span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-2 px-2">
            <span>Entry</span>
            <span className="text-right">Budget</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Δ</span>
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {periodBlock.entries.map((e) => {
              const isOver = e.actual > e.budget;

              return (
                <div
                  key={e.entry_id}
                  className="grid grid-cols-4 gap-4 items-center px-3 py-3 rounded-xl
                             bg-gray-950 border border-gray-800
                             hover:border-blue-500/40 transition"
                >
                  {/* Entry name */}
                  <span className="text-white font-medium truncate">
                    {e.entry_name}
                  </span>

                  {/* Budget */}
                  <span className="text-right font-mono text-gray-300">
                    {e.budget.toLocaleString()}
                  </span>

                  {/* Actual */}
                  <span
                    className={`text-right font-mono ${
                      e.actual < 0 ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {e.actual.toLocaleString()}
                  </span>

                  {/* Delta */}
                  <span
                    className={`text-right font-mono px-2 py-1 rounded-lg
                      ${
                        isOver
                          ? 'bg-red-900/40 text-red-400'
                          : 'bg-green-900/40 text-green-400'
                      }`}
                  >
                    {e.delta >= 0 ? '+' : ''}
                    {e.delta.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Helper */
function groupByPeriod(rows) {
  return Object.values(
    rows.reduce((acc, row) => {
      if (!acc[row.period]) {
        acc[row.period] = { period: row.period, entries: [] };
      }
      acc[row.period].entries.push(row);
      return acc;
    }, {})
  );
}
