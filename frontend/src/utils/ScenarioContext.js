// src/context/ScenarioContext.jsx
import { createContext, useContext, useState } from "react";

const ScenarioContext = createContext(null);

export const useScenario = () => {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error("useScenario must be used inside ScenarioProvider");
  }
  return ctx;
};

export const ScenarioProvider = ({ children }) => {
  const [scenarioId, setScenarioId] = useState(null);

  return (
    <ScenarioContext.Provider value={{ scenarioId, setScenarioId }}>
      {children}
    </ScenarioContext.Provider>
  );
};
