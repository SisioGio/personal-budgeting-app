import React from "react";
import { NavLink } from "react-router-dom";
import { useScenarios } from "../queries/useScenarios";
import { useScenario } from "../utils/ScenarioContext";

export default function Nav() {
  const { scenarioId, setScenarioId } = useScenario();
  const { data: scenarios = [], isLoading } = useScenarios();

  const tabs = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/settings", label: "Settings" },
    { path: "/actuals", label: "Actuals" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40" />
          <span className="text-2xl font-extrabold tracking-wide text-white">
            Finbotix
          </span>
        </div>

        {/* CENTER NAV TABS */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl backdrop-blur">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `
                relative px-5 py-2 rounded-lg text-sm font-semibold transition-all
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
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur border border-white/10">
          <span className="text-xs uppercase tracking-wide text-gray-300">
            Scenario
          </span>

          {isLoading ? (
            <span className="text-sm text-gray-400">Loading…</span>
          ) : (
            <select
              value={scenarioId ?? ""}
              onChange={(e) => setScenarioId(e.target.value)}
              className="
                bg-transparent text-white text-sm font-medium
                focus:outline-none cursor-pointer
              "
            >
              <option value="" className="text-black">
                Select
              </option>
              {scenarios.map((s) => (
                <option key={s.id ?? s.code} value={s.id} className="text-black">
                  {s.code}
                </option>
              ))}
            </select>
          )}
        </div>

      </nav>
    </header>
  );
}
