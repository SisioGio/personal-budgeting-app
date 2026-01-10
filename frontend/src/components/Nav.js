import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useScenarios } from "../queries/useScenarios";
import { useScenario } from "../utils/ScenarioContext";
import { useAuth } from "../utils/AuthContext";

export default function Nav() {
  const { scenarioId, setScenarioId } = useScenario();
  const { data: scenarios = [], isLoading } = useScenarios();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // Auto-select first scenario if none selected and scenarios are available
  useEffect(() => {
    if (!scenarioId && scenarios.length > 0 && !isLoading) {
      // Check if the saved scenario still exists in the list
      const savedExists = scenarios.some(s => s.id === scenarioId);

      // If no scenario selected or saved scenario no longer exists, select the first one
      if (!savedExists) {
        setScenarioId(scenarios[0].id);
      }
    }
  }, [scenarios, scenarioId, setScenarioId, isLoading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { path: "/dashboard", label: "Dashboard" },
       { path: "/actuals", label: "Actuals" },
    { path: "/settings", label: "Settings" },

  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">

        {/* Top Row: Logo + Scenario (on mobile) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          {/* LOGO */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40" />
            

            <NavLink
              key='home'
              to='/'
              className="text-xl sm:text-2xl font-extrabold tracking-wide text-white"
              
            >
             Finalyze
            </NavLink>
          </div>

         
        {auth && ( <div className={`flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur border transition-all text-xs ${
            !scenarioId && scenarios.length > 0
              ? 'bg-yellow-600/20 border-yellow-500/50 animate-pulse'
              : 'bg-white/5 border-white/10'
          }`}>
            {isLoading ? (
              <span className="text-xs text-gray-400">Loading…</span>
            ) : (
              <>
                <select
                  value={scenarioId ?? ""}
                  onChange={(e) => setScenarioId(e.target.value)}
                  className={`
                    bg-transparent text-xs font-medium
                    focus:outline-none cursor-pointer
                    ${!scenarioId && scenarios.length > 0 ? 'text-yellow-400' : 'text-white'}
                  `}
                >
                  <option value="" className="text-black">
                    {scenarios.length === 0 ? 'No scenarios' : 'Select'}
                  </option>
                  {scenarios.map((s) => (
                    <option key={s.id ?? s.code} value={s.id} className="text-black">
                      {s.code}
                    </option>
                  ))}
                </select>
                {!scenarioId && scenarios.length > 0 && (
                  <span className="text-yellow-400 text-xs">⚠️</span>
                )}
              </>
            )}
          </div>
           )}
        </div>
         

        {/* CENTER NAV TABS */}
        {auth && (<div className="flex gap-1 sm:gap-2 bg-white/5 p-1 rounded-xl backdrop-blur w-full sm:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `
                relative px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none text-center
                ${
                  isActive
                    ? "text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }
              `
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>)}

        {/* SCENARIO SELECTOR - Desktop only */}
        {auth && (<div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur border transition-all ${
          !scenarioId && scenarios.length > 0
            ? 'bg-yellow-600/20 border-yellow-500/50 animate-pulse'
            : 'bg-white/5 border-white/10'
        }`}>
          <span className={`text-xs uppercase tracking-wide ${
            !scenarioId && scenarios.length > 0 ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            Scenario
          </span>

          {isLoading ? (
            <span className="text-sm text-gray-400">Loading…</span>
          ) : (
            <>
              <select
                value={scenarioId ?? ""}
                onChange={(e) => setScenarioId(e.target.value)}
                className={`
                  bg-transparent text-sm font-medium
                  focus:outline-none cursor-pointer
                  ${!scenarioId && scenarios.length > 0 ? 'text-yellow-400' : 'text-white'}
                `}
              >
                <option value="" className="text-black">
                  {scenarios.length === 0 ? 'No scenarios' : 'Select one'}
                </option>
                {scenarios.map((s) => (
                  <option key={s.id ?? s.code} value={s.id} className="text-black">
                    {s.code}
                  </option>
                ))}
              </select>
              {!scenarioId && scenarios.length > 0 && (
                <span className="text-yellow-400 text-xs">⚠️</span>
              )}
            </>
          )}
        </div>)}

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-2">
          {auth ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 rounded-lg transition-all shadow-md"
              >
                Register
              </button>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
